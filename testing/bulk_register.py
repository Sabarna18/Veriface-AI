import json
import sys
import os
import requests
from pathlib import Path

# ===================================================
# CONFIG
# ===================================================

DUMMY_IMAGE = "dummy_face.jpg"

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png"}


# ===================================================
# VALIDATE IMAGE
# ===================================================


def validate_image():

    if not os.path.exists(DUMMY_IMAGE):

        print(f"❌ Dummy image not found: {DUMMY_IMAGE}")

        sys.exit(1)

    ext = Path(DUMMY_IMAGE).suffix.lower()

    if ext not in SUPPORTED_EXTENSIONS:

        print("❌ Invalid image format. " "Use JPG / JPEG / PNG")

        sys.exit(1)


# ===================================================
# ADMIN LOGIN
# ===================================================


def get_admin_token(port, username, password):

    login_url = f"http://localhost:{port}/auth/login"

    data = {"username": username, "password": password}

    try:

        response = requests.post(login_url, data=data)

        if response.status_code != 200:

            print("❌ Admin login failed:")

            print(response.text)

            sys.exit(1)

        response_data = response.json()

        token = response_data["access_token"]

        print("✅ Admin authenticated\n")

        return token

    except Exception as e:

        print("🔥 Login error:", e)

        sys.exit(1)


# ===================================================
# REGISTER SINGLE USER
# ===================================================


def register_single_user(
    api_url,
    token,
    user_id,
    classroom_id,
):

    headers = {"Authorization": f"Bearer {token}"}

    try:

        with open(DUMMY_IMAGE, "rb") as img:

            # -------------------------------------------
            # FORM DATA
            # -------------------------------------------

            files = {"image": (os.path.basename(DUMMY_IMAGE), img, "image/jpeg")}

            payload = {
                "user_id": user_id,
                "classroom_id": classroom_id,
            }

            # -------------------------------------------
            # REQUEST
            # -------------------------------------------

            response = requests.post(
                api_url,
                data=payload,
                files=files,
                headers=headers,
                timeout=120,
            )

        # -------------------------------------------
        # SUCCESS
        # -------------------------------------------

        if response.status_code == 200:

            response_data = response.json()

            print(f"✅ Registered: {user_id}")

            print(f"   ↳ Embedding Model: " f"{response_data.get('embedding_model')}")

            print(
                f"   ↳ Embedding Version: " f"{response_data.get('embedding_version')}"
            )

            return True

        # -------------------------------------------
        # FAILURE
        # -------------------------------------------

        try:

            detail = response.json().get("detail", response.text)

        except Exception:

            detail = response.text

        print(f"❌ Failed: {user_id}")

        print(f"   ↳ Reason: {detail}")

        return False

    except requests.Timeout:

        print(f"⏱ Timeout: {user_id}")

        return False

    except Exception as e:

        print(f"🔥 Error: {user_id}")

        print(f"   ↳ {e}")

        return False


# ===================================================
# BULK REGISTER
# ===================================================


def bulk_register(json_file, port, token):

    validate_image()

    if not os.path.exists(json_file):

        print(f"❌ JSON file not found: " f"{json_file}")

        sys.exit(1)

    # -----------------------------------------------
    # LOAD JSON
    # -----------------------------------------------

    with open(json_file, "r") as f:

        data = json.load(f)

    classroom_id = data["classroom_id"]

    users = data["users"]

    api_url = f"http://localhost:{port}/register/"

    print("\n===================================")

    print(f"📌 Classroom: {classroom_id}")

    print(f"🌐 API: {api_url}")

    print(f"🖼 Image: {DUMMY_IMAGE}")

    print(f"👥 Users: {len(users)}")

    print("===================================\n")

    # -----------------------------------------------
    # STATS
    # -----------------------------------------------

    success = 0

    failed = 0

    # -----------------------------------------------
    # REGISTER LOOP
    # -----------------------------------------------

    for idx, user in enumerate(users, start=1):

        user_id = user["user_id"]

        print(f"[{idx}/{len(users)}] " f"Processing {user_id}...")

        result = register_single_user(
            api_url=api_url,
            token=token,
            user_id=user_id,
            classroom_id=classroom_id,
        )

        if result:
            success += 1
        else:
            failed += 1

        print()

    # -----------------------------------------------
    # SUMMARY
    # -----------------------------------------------

    print("\n===================================")

    print("📊 BULK REGISTRATION COMPLETE")

    print("-----------------------------------")

    print(f"✔ Success : {success}")

    print(f"✖ Failed  : {failed}")

    print(f"📦 Total   : {len(users)}")

    print("===================================\n")


# ===================================================
# ENTRY POINT
# ===================================================

if __name__ == "__main__":

    print("\n🚀 VeriFace Bulk Registration\n")

    port = input("Enter backend port (e.g. 8002): ").strip()

    json_path = input("Enter users JSON file path: ").strip()

    admin_user = input("Enter admin user_id: ").strip()

    admin_pass = input("Enter admin password: ").strip()

    token = get_admin_token(port, admin_user, admin_pass)

    bulk_register(json_file=json_path, port=port, token=token)
