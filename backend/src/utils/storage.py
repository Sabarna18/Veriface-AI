from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from supabase import Client, create_client

from core.config import settings


class StorageService:
    """
    Wrapper around Supabase Storage.

    Responsible for:

    - Uploading face images
    - Downloading face images
    - Deleting face images

    Only the storage key is stored in the database.
    """

    def __init__(self) -> None:
        self.client: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )

        self.bucket = settings.SUPABASE_BUCKET

    # ==========================================================
    # Upload
    # ==========================================================

    def upload_face(
        self,
        file_path: Path,
        classroom_id: str,
        user_id: str,
    ) -> str:
        """
        Upload a face image to Supabase.

        Returns
        -------
        Storage key to persist in the database.
        """

        extension = file_path.suffix.lower()

        storage_key = f"{classroom_id}/{user_id}/{uuid4().hex}{extension}"

        with file_path.open("rb") as file:
            self.client.storage.from_(self.bucket).upload(
                path=storage_key,
                file=file,
                file_options={
                    "content-type": "image/jpeg",
                    "upsert": False,
                },
            )

        return storage_key

    # ==========================================================
    # Download
    # ==========================================================

    def download_face(
        self,
        storage_key: str,
    ) -> bytes:
        """
        Download image bytes from Supabase Storage
        with detailed debug logging.
        """

        print("\n" + "=" * 60)
        print("SUPABASE DOWNLOAD")
        print("=" * 60)
        print(f"Bucket           : {self.bucket}")
        print(f"Storage Key      : {storage_key}")
        print(f"Storage Key repr : {repr(storage_key)}")
        print(f"Storage Key type : {type(storage_key).__name__}")
        print("=" * 60)

        try:
            data = self.client.storage.from_(self.bucket).download(storage_key.strip())

            print("✓ Download successful")
            print(f"Downloaded bytes : {len(data)}")
            print("=" * 60 + "\n")

            return data

        except Exception as e:
            print("\n" + "=" * 60)
            print("SUPABASE DOWNLOAD FAILED")
            print("=" * 60)
            print(f"Bucket           : {self.bucket}")
            print(f"Storage Key      : {storage_key}")
            print(f"Storage Key repr : {repr(storage_key)}")
            print(f"Exception Type   : {type(e).__name__}")
            print(f"Exception        : {e}")

            # Try listing the directory to help diagnose path issues
            try:
                from pathlib import Path

                parent = str(Path(storage_key).parent)

                print(f"\nListing parent folder: {parent}")

                objects = self.client.storage.from_(self.bucket).list(parent)

                print("Objects found:")
                for obj in objects:
                    print(f"  - {obj.get('name')}")

            except Exception as list_error:
                print(f"Failed to list parent directory: {list_error}")

            print("=" * 60 + "\n")

            raise

    # ==========================================================
    # Delete
    # ==========================================================

    def delete_face(
        self,
        storage_key: str,
    ) -> None:
        """
        Delete an image from storage.
        """

        self.client.storage.from_(self.bucket).remove([storage_key])

    # ==========================================================
    # Public URL
    # ==========================================================

    def get_public_url(
        self,
        storage_key: str,
    ) -> str:
        """
        Returns public URL.

        Useful if bucket becomes public.
        """

        return self.client.storage.from_(self.bucket).get_public_url(storage_key)


storage = StorageService()
