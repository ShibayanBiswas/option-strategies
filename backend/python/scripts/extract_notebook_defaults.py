"""One-off: print notebook cell titles and key params."""
import json
import re
import urllib.request

url = (
    "https://raw.githubusercontent.com/chenenen13/Trading-Strategies/main/"
    "Trading%20strategies%20implemented%20on%20Python/options/Trading_strategies_Options.ipynb"
)
with urllib.request.urlopen(url, timeout=60) as r:
    nb = json.load(r)

for i, cell in enumerate(nb["cells"]):
    src = "".join(cell.get("source", []))
    if "ST = np.linspace" not in src and "payoff" not in src.lower():
        continue
    m = re.search(r"plt\.title\('([^']+)'", src)
    title = m.group(1) if m else f"cell {i}"
    keys = [
        "S0 =",
        "K =",
        "K1 =",
        "K2 =",
        "K3 =",
        "K4 =",
        "D =",
        "C =",
        "H =",
        "NL =",
        "NS =",
        "ST = np.linspace",
        "sigma =",
        "r =",
        "T_short",
        "T_long",
        "T =",
    ]
    print(f"--- {i}: {title} ---")
    for line in src.split("\n"):
        s = line.strip()
        if any(s.startswith(k) for k in keys):
            print(s.split("#")[0].strip())
    print()
