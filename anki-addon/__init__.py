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
