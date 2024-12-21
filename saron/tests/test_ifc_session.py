from saron.ifc_session import IfcSession
from unittest import TestCase

session = IfcSession()
session.create_new_ifc_project()

class TestIfcSession(TestCase):
    def test_load_ifc_file(self):
        session.open_ifc_project("/Users/anthonydemattos/auto-bim/train/dataset/aisc.ifc")
        assert session.file is not None

    def test_get_geometry_tree(self):
        tree = session.get_geometry_tree()
        assert tree is not None
