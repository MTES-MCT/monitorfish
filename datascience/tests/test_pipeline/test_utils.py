import os
import shutil
import tempfile
import unittest
from pathlib import Path

from shapely import MultiPolygon

from src.pipeline.utils import move


class TestProcessingMethods(unittest.TestCase):
    def test_move_file_into_existing_directory(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir = Path(tmpdir)
            dest_dirpath = tmpdir / "destination/directory"
            os.makedirs(dest_dirpath)

            # Create a test file in tmpdir
            tmp_file_path = tmpdir / "test_file.txt"
            with open(tmp_file_path, "w+") as f:
                f.write("Test file.")
            self.assertIn("test_file.txt", os.listdir(tmpdir))
            self.assertNotIn("test_file.txt", os.listdir(dest_dirpath))

            # Move the test file and test
            move(tmp_file_path, dest_dirpath=dest_dirpath)
            self.assertNotIn("test_file.txt", os.listdir(tmpdir))
            self.assertIn("test_file.txt", os.listdir(dest_dirpath))
            with open(dest_dirpath / "test_file.txt", "r") as f:
                self.assertEqual(f.read(), "Test file.")

    def test_move_file_into_non_existing_directory(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir = Path(tmpdir)
            dest_dirpath = tmpdir / "destination/directory"

            # Create a test file in tmp_dir
            tmp_file_path = tmpdir / "test_file.txt"
            with open(tmp_file_path, "w+") as f:
                f.write("Test file.")
            self.assertIn("test_file.txt", os.listdir(tmpdir))

            # Move the test file and test
            move(tmp_file_path, dest_dirpath=dest_dirpath)
            self.assertNotIn("test_file.txt", os.listdir(tmpdir))
            self.assertIn("test_file.txt", os.listdir(dest_dirpath))
            with open(dest_dirpath / "test_file.txt", "r") as f:
                self.assertEqual(f.read(), "Test file.")

    def test_move_file_already_exists(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir = Path(tmpdir)
            dest_dirpath = tmpdir / "destination/directory"
            os.makedirs(dest_dirpath)

            # Create a test file in tmpdir and in dest_dir
            tmp_file_path = tmpdir / "test_file.txt"
            with open(tmp_file_path, "w+") as f:
                f.write("New file.")
            with open(dest_dirpath / "test_file.txt", "w+") as f:
                f.write("Original file.")

            self.assertIn("test_file.txt", os.listdir(tmpdir))
            self.assertIn("test_file.txt", os.listdir(dest_dirpath))

            # Move the test file and test
            with self.assertRaises(shutil.Error):  # Raise an error by default...
                move(tmp_file_path, dest_dirpath)

            move(tmp_file_path, dest_dirpath, if_exists="replace")  # Unless specified

            self.assertNotIn("test_file.txt", os.listdir(tmpdir))
            self.assertIn("test_file.txt", os.listdir(dest_dirpath))

            with open(dest_dirpath / "test_file.txt", "r") as f:
                self.assertEqual(f.read(), "New file.")

            # Test if_exists argument
            with self.assertRaises(ValueError):
                move(tmp_file_path, dest_dirpath, if_exists="unexpected")


def make_square_multipolygon(
    init_lon,
    init_lat,
    width,
    height,
):
    return MultiPolygon(
        [
            (
                (
                    (init_lon, init_lat),
                    (init_lon + width, init_lat),
                    (init_lon + width, init_lat + height),
                    (init_lon, init_lat + height),
                ),
                [],
            )
        ]
    )
