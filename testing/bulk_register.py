import json
import sys
import os
import requests

DUMMY_IMAGE = "dummy_face.jpg"  # one reusable image


def bulk_register(json_file, port):
    if not os.path.exists(DUMMY_IMAGE):
        print(f"❌ Dummy image not found: {DUMMY_IMAGE}")
        sys.exit(1)

    with open(json_file, "r") as f:
        data = json.load(f)

    classroom_id = data["classroom_id"]
    users = data["users"]

    api_url = f"http://localhost:{port}/register"

    print(f"\n📌 Classroom: {classroom_id}")
    print(f"🌐 API: {api_url}")
    print(f"🖼 Using dummy image: {DUMMY_IMAGE}\n")

    success, failed = 0, 0

    for user in users:
        user_id = user["user_id"]

        files = {
            "image": open(DUMMY_IMAGE, "rb")
        }

        payload = {
            "user_id": user_id,
            "classroom_id": classroom_id
        }

        try:
            response = requests.post(
                api_url,
                data=payload,
                files=files
            )

            if response.status_code == 200:
                print(f"✅ Registered: {user_id}")
                success += 1
            else:
                detail = response.json().get("detail", "Unknown error")
                print(f"❌ Failed: {user_id} → {detail}")
                failed += 1

        except Exception as e:
            print(f"🔥 Error: {user_id} → {e}")
            failed += 1

    print("\n======================")
    print(f"✔ Success: {success}")
    print(f"✖ Failed: {failed}")
    print("======================\n")


if __name__ == "__main__":
    
    port = input("enter running port:")
    json_path = input("Enter users json file path: ")
    bulk_register(json_file=json_path , port=port)
