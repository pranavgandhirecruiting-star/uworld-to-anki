#!/bin/bash
set -e

echo "Building React UI..."
npm run build

echo "Packaging Anki add-on..."
cd anki-addon
rm -f ../ollopa.ankiaddon
zip -r ../ollopa.ankiaddon . -x "*__pycache__*" "*.pyc"
cd ..

echo ""
echo "Done! Created: ollopa.ankiaddon"
echo ""
echo "To install:"
echo "  1. Open Anki"
echo "  2. Go to Tools → Add-ons → Install from file"
echo "  3. Select ollopa.ankiaddon"
echo "  4. Restart Anki"
echo "  5. Go to Tools → Ollopa"
