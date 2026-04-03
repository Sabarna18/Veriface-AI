import json
import sys
import os
import requests

DUMMY_IMAGE = "dummy_face.jpg"


# ---------------------------------------------------
# 🔐 LOGIN FUNCTION (GET TOKEN)
# ---------------------------------------------------
def get_admin_token(port, username, password):
    login_url = f"http://localhost:{port}/auth/login"

    data = {
        "username": username,
        "password": password
    }

    try:
        response = requests.post(login_url, data=data)

        if response.status_code != 200:
            print("❌ Admin login failed:", response.text)
            sys.exit(1)

        token = response.json()["access_token"]
        print("✅ Admin authenticated\n")
        return token

    except Exception as e:
        print("🔥 Login error:", e)
        sys.exit(1)


# ---------------------------------------------------
# 📦 BULK REGISTER
# ---------------------------------------------------
def bulk_register(json_file, port, token):
    if not os.path.exists(DUMMY_IMAGE):
        print(f"❌ Dummy image not found: {DUMMY_IMAGE}")
        sys.exit(1)

    with open(json_file, "r") as f:
        data = json.load(f)

    classroom_id = data["classroom_id"]
    users = data["users"]

    api_url = f"http://localhost:{port}/register/"

    headers = {
        "Authorization": f"Bearer {token}"
    }

    print(f"\n📌 Classroom: {classroom_id}")
    print(f"🌐 API: {api_url}")
    print(f"🖼 Using dummy image: {DUMMY_IMAGE}\n")

    success, failed = 0, 0

    for user in users:
        user_id = user["user_id"]

        try:
            with open(DUMMY_IMAGE, "rb") as img:
                files = {
                    "image": img
                }

                payload = {
                    "user_id": user_id,
                    "classroom_id": classroom_id
                }

                response = requests.post(
                    api_url,
                    data=payload,
                    files=files,
                    headers=headers
                )

            if response.status_code == 200:
                print(f"✅ Registered: {user_id}")
                success += 1
            else:
                try:
                    detail = response.json().get("detail", response.text)
                except:
                    detail = response.text
                print(f"❌ Failed: {user_id} → {detail}")
                failed += 1

        except Exception as e:
            print(f"🔥 Error: {user_id} → {e}")
            failed += 1

    print("\n======================")
    print(f"✔ Success: {success}")
    print(f"✖ Failed: {failed}")
    print("======================\n")


# ---------------------------------------------------
# 🚀 ENTRY POINT
# ---------------------------------------------------
if __name__ == "__main__":
    port = input("Enter backend port (e.g. 8002): ")
    json_path = input("Enter users JSON file path: ")

    admin_user = input("Enter admin user_id: ")
    admin_pass = input("Enter admin password: ")

    token = get_admin_token(port, admin_user, admin_pass)

    bulk_register(
        json_file=json_path,
        port=port,
        token=token
    )