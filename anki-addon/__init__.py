"""
UWorld to Anki — Paste QIDs, find cards, unsuspend, study.

Embeds a local web server inside Anki that serves a React UI
and exposes API endpoints for card lookup and management.
No external dependencies required.
"""

import webbrowser

from aqt import gui_hooks, mw
from aqt.qt import QAction, QTimer
from aqt.utils import showInfo, qconnect

from .server import BIND_ADDRESS, BIND_PORT, WebServer

URL = f"http://{BIND_ADDRESS}:{BIND_PORT}"


def api_handler(request):
    """Route API requests to the appropriate handler."""
    action = request.get("action", "")
    params = request.get("params", {})

    handlers = {
        "version": handle_version,
        "findCards": handle_find_cards,
        "cardsInfo": handle_cards_info,
        "unsuspend": handle_unsuspend,
        "suspend": handle_suspend,
        "deckNames": handle_deck_names,
        "createDeck": handle_create_deck,
        "changeDeck": handle_change_deck,
        "searchCards": handle_search_cards,
        "getStudyStats": handle_get_study_stats,
    }

    handler = handlers.get(action)
    if handler is None:
        return {"result": None, "error": f"Unknown action: {action}"}

    try:
        result = handler(**params)
        return {"result": result, "error": None}
    except Exception as e:
        return {"result": None, "error": str(e)}


def handle_version():
    return 1


def handle_find_cards(query=""):
    if not mw.col:
        raise Exception("Collection not loaded")
    return list(mw.col.find_cards(query))


def handle_cards_info(cards=None):
    if not mw.col:
        raise Exception("Collection not loaded")
    if not cards:
        return []

    result = []
    for card_id in cards:
        try:
            card = mw.col.get_card(card_id)
            note = card.note()

            fields = {}
            for i, name in enumerate(note.keys()):
                fields[name] = {"value": note.fields[i], "order": i}

            result.append({
                "cardId": card.id,
                "noteId": note.id,
                "fields": fields,
                "tags": note.tags,
                "queue": card.queue,
                "type": card.type,
                "deckName": mw.col.decks.name(card.did),
            })
        except Exception:
            pass

    return result


def handle_unsuspend(cards=None):
    if not mw.col:
        raise Exception("Collection not loaded")
    if cards:
        mw.col.sched.unsuspend_cards(cards)
        mw.reset()
    return True


def handle_suspend(cards=None):
    if not mw.col:
        raise Exception("Collection not loaded")
    if cards:
        mw.col.sched.suspend_cards(cards)
        mw.reset()
    return True


def handle_deck_names():
    if not mw.col:
        raise Exception("Collection not loaded")
    return [d.name for d in mw.col.decks.all_names_and_ids()]


def handle_create_deck(name=""):
    if not mw.col:
        raise Exception("Collection not loaded")
    if not name.strip():
        raise Exception("Deck name is required")
    result = mw.col.decks.add_normal_deck_with_name(name.strip())
    mw.reset()
    return {"id": result.id, "name": name.strip()}


def handle_search_cards(query="", limit=200):
    """Search cards by content/tags and return text previews for LLM matching."""
    if not mw.col:
        raise Exception("Collection not loaded")
    if not query.strip():
        raise Exception("Search query is required")

    import re

    card_ids = list(mw.col.find_cards(query.strip()))[:limit]
    results = []

    for card_id in card_ids:
        try:
            card = mw.col.get_card(card_id)
            note = card.note()

            # Combine all field text, strip HTML
            text_parts = []
            for field_val in note.fields:
                clean = re.sub(r'<[^>]*>', '', field_val).strip()
                if clean:
                    text_parts.append(clean)
            text = " | ".join(text_parts)

            # Truncate to ~300 chars to keep payload manageable
            if len(text) > 300:
                text = text[:300] + "..."

            results.append({
                "cardId": card.id,
                "text": text,
                "tags": note.tags,
                "deckName": mw.col.decks.name(card.did),
                "queue": card.queue,
            })
        except Exception:
            pass

    return results


def handle_change_deck(cards=None, deck=""):
    if not mw.col:
        raise Exception("Collection not loaded")
    if not cards:
        raise Exception("No cards specified")
    if not deck.strip():
        raise Exception("Deck name is required")
    # Find or create the target deck
    deck_id = mw.col.decks.id_for_name(deck.strip())
    if deck_id is None:
        result = mw.col.decks.add_normal_deck_with_name(deck.strip())
        deck_id = result.id
    mw.col.set_deck(cards, deck_id)
    mw.reset()
    return True


def handle_get_study_stats():
    """Get card review stats grouped by top-level AnKing topic tags."""
    if not mw.col:
        raise Exception("Collection not loaded")

    from collections import defaultdict

    # Find all cards in the collection
    all_card_ids = mw.col.find_cards("")
    topic_stats = defaultdict(lambda: {
        "total": 0, "suspended": 0, "due": 0,
        "highLapse": 0, "new": 0,
    })

    # Today's due cutoff
    import time
    today = int(time.time())

    for card_id in all_card_ids:
        try:
            card = mw.col.get_card(card_id)
            note = card.note()

            # Extract top-level topic from AnKing tags
            # e.g., "#AK_Step1_v12::Cardiology::Heart_Failure" → "Cardiology"
            topic = None
            for tag in note.tags:
                if tag.startswith("#AK_Step") and "::" in tag:
                    parts = tag.split("::")
                    if len(parts) >= 2:
                        # Skip the #AK_Step1_v12 prefix, get first topic
                        candidate = parts[1].lstrip("#")
                        if candidate and candidate not in ("UWorld", "AMBOSS", "Pathoma", "Boards_and_Beyond", "SketchyMedical"):
                            topic = candidate.replace("_", " ")
                            break

            if not topic:
                topic = "Other"

            stats = topic_stats[topic]
            stats["total"] += 1

            if card.queue == -1:
                stats["suspended"] += 1
            elif card.queue == 0:
                stats["new"] += 1

            # Card is due if queue > 0 and due <= today
            if card.queue in (1, 2, 3) and card.due <= today:
                stats["due"] += 1

            # High lapse = forgotten 3+ times
            if card.lapses >= 3:
                stats["highLapse"] += 1

        except Exception:
            pass

    # Convert to sorted list
    results = []
    for topic, stats in sorted(topic_stats.items(), key=lambda x: x[1]["total"], reverse=True):
        results.append({
            "topic": topic,
            "total": stats["total"],
            "suspended": stats["suspended"],
            "due": stats["due"],
            "highLapse": stats["highLapse"],
            "new": stats["new"],
        })

    return results


# ── Server lifecycle ──

_server = None
_timer = None


def start_server():
    global _server, _timer

    if _server is not None:
        return

    _server = WebServer(api_handler)
    try:
        _server.listen()
    except OSError as e:
        showInfo(
            f"UWorld → Anki: Could not start server on port {BIND_PORT}.\n"
            f"Another instance may already be running.\n\n"
            f"Error: {e}"
        )
        _server = None
        return

    _timer = QTimer()
    _timer.timeout.connect(_server.advance)
    _timer.start(100)


def stop_server():
    global _server, _timer

    if _timer is not None:
        _timer.stop()
        _timer = None

    if _server is not None:
        _server.close()
        _server = None


def open_browser():
    """Open the UWorld → Anki UI in the default browser."""
    if _server is None:
        showInfo("UWorld → Anki server is not running. Please restart Anki.")
        return
    webbrowser.open(URL)


# ── Anki integration ──

def on_profile_loaded():
    start_server()

    # Add menu item
    action = QAction("UWorld → Anki", mw)
    qconnect(action.triggered, open_browser)
    mw.form.menuTools.addAction(action)


def on_profile_will_close():
    stop_server()


gui_hooks.profile_did_open.append(on_profile_loaded)
gui_hooks.profile_will_close.append(on_profile_will_close)
