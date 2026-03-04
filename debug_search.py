import os

target = "AiOutl"
for root, dirs, files in os.walk("src"):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    if len(lines) >= 97:
                        line97 = lines[96] # 0-indexed
                        if target in line97:
                            print(f"FOUND in {path} at line 97: {line97.strip()}")
                        # Also check surrounding lines just in case
                        for i in range(max(0, 90), min(len(lines), 110)):
                            if target in lines[i]:
                                print(f"FOUND in {path} at line {i+1}: {lines[i].strip()}")
            except Exception as e:
                print(f"Error reading {path}: {e}")
