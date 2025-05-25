from app.core.mongo import template_structures

sample = {
    "template_id": "template-001",
    "structure": {
        "root": {
            "type": "folder",
            "children": [
                {"name": "main.py", "type": "file"},
                {"name": "utils", "type": "folder"}
            ]
        }
    }
}

result = template_structures.insert_one(sample)
print("✅ Inserted ID:", result.inserted_id)
