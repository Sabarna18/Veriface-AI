from unittest.mock import patch

from core.config import settings
from core.embedding_manager import generate_embedding


def test_generate_embedding_success():
    """
    generate_embedding should extract the DeepFace embedding
    and attach the configured embedding metadata.
    """
    dummy_embedding = [0.1] * 512

    deepface_result = [
        {
            "embedding": dummy_embedding,
            "facial_area": {
                "x": 10,
                "y": 20,
                "w": 100,
                "h": 100,
            },
            "face_confidence": 0.99,
        }
    ]

    with patch(
        "core.embedding_manager.DeepFace.represent",
        return_value=deepface_result,
    ) as mock_represent:
        result = generate_embedding("dummy.jpg")

    assert result is not None
    assert result["embedding"] == dummy_embedding
    assert len(result["embedding"]) == 512

    assert result["embedding_version"] == settings.EMBEDDING_VERSION
    assert result["model_name"] == settings.MODEL_NAME
    assert result["detector_backend"] == settings.DETECTOR_BACKEND

    mock_represent.assert_called_once_with(
        img_path="dummy.jpg",
        model_name=settings.MODEL_NAME,
        detector_backend=settings.DETECTOR_BACKEND,
        enforce_detection=False,
    )


def test_generate_embedding_empty_deepface_result():
    """
    generate_embedding should return None when DeepFace
    returns no face representation.
    """
    with patch(
        "core.embedding_manager.DeepFace.represent",
        return_value=[],
    ):
        result = generate_embedding("dummy.jpg")

    assert result is None


def test_generate_embedding_missing_embedding():
    """
    generate_embedding should return None when DeepFace
    returns a result without an embedding.
    """
    deepface_result = [
        {
            "facial_area": {
                "x": 10,
                "y": 20,
                "w": 100,
                "h": 100,
            }
        }
    ]

    with patch(
        "core.embedding_manager.DeepFace.represent",
        return_value=deepface_result,
    ):
        result = generate_embedding("dummy.jpg")

    assert result is None


def test_generate_embedding_metadata():
    """
    Returned metadata should reflect the application's
    configured embedding pipeline.
    """
    dummy_embedding = [0.25] * 512

    with patch(
        "core.embedding_manager.DeepFace.represent",
        return_value=[{"embedding": dummy_embedding}],
    ):
        result = generate_embedding("test-face.jpg")

    assert result == {
        "embedding": dummy_embedding,
        "embedding_version": settings.EMBEDDING_VERSION,
        "model_name": settings.MODEL_NAME,
        "detector_backend": settings.DETECTOR_BACKEND,
    }