import os

root = r"C:\Users\mukht\Desktop\vs code projects\STREAMLUX-main"
print(f"Scanning {root}...")

for dirpath, dirnames, filenames in os.walk(root, topdown=False):
    # Process files first, then directories
    for name in filenames:
        if "\r" in name or "\n" in name or name.endswith(" "):
            old_path = os.path.join(dirpath, name)
            new_name = name.replace("\r", "").replace("\n", "").strip()
            new_path = os.path.join(dirpath, new_name)
            print(f"Renaming file: {repr(name)} -> {repr(new_name)}")
            try:
                # If target already exists, we might need to remove the corrupt one
                if os.path.exists(new_path) and old_path != new_path:
                    os.remove(old_path)
                    print(f"Target exists, removed corrupt file.")
                else:
                    os.rename(old_path, new_path)
            except Exception as e:
                print(f"Failed to rename file {repr(name)}: {e}")

    for name in dirnames:
        if "\r" in name or "\n" in name or name.endswith(" "):
            old_path = os.path.join(dirpath, name)
            new_name = name.replace("\r", "").replace("\n", "").strip()
            new_path = os.path.join(dirpath, new_name)
            print(f"Renaming dir: {repr(name)} -> {repr(new_name)}")
            try:
                os.rename(old_path, new_path)
            except Exception as e:
                print(f"Failed to rename dir {repr(name)}: {e}")

print("Cleanup complete.")
