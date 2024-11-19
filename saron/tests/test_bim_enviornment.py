import unittest
import ifcopenshell
from saron.core import BimEnvironment
import json


class TestBimEnvironment(unittest.TestCase):
    def setUp(self):
        self.bim_env = BimEnvironment()

    def test_create_storey(self):
        storey = self.bim_env.create_storey(name="Ground Floor", elevation=0.0)
        self.assertIsNotNone(storey)
        self.assertEqual(storey.Name, "Ground Floor")
        self.assertEqual(storey.Elevation, 0.0)

    def test_create_entity(self):
        entity = self.bim_env.create_entity(ifc_class="IfcWall")
        self.assertIsNotNone(entity)
        self.assertEqual(entity.is_a(), "IfcWall")

    def test_assign_container(self):
        storey = self.bim_env.create_storey(name="First Floor", elevation=3.0)
        wall = self.bim_env.create_entity(ifc_class="IfcWall")
        self.bim_env.assign_container(wall, storey)
        container = ifcopenshell.util.element.get_container(wall)
        self.assertEqual(container.GlobalId, storey.GlobalId)

    def test_get_current_state(self):
        state = self.bim_env.get_current_state()
        self.assertIsInstance(state, str)  # Check if it's a string
        self.assertTrue("My Project" in state)  # Ensure the project name appears

    def test_get_element(self):
        # Create an entity and retrieve its details
        wall = self.bim_env.create_entity(ifc_class="IfcWall")
        guid = wall.GlobalId
        element_info = json.loads(self.bim_env.get_element(guid))

        self.assertEqual(element_info["element"]["GlobalId"], guid)
        self.assertIn("psets_and_qtos", element_info)
        self.assertIn("container", element_info)

    def test_create_project_structure(self):
        project_tree = self.bim_env.get_current_state()
        self.assertTrue("Site" in project_tree)
        self.assertTrue("Building" in project_tree)

    def test_model_integrity(self):
        # Ensure model integrity after multiple operations
        storey = self.bim_env.create_storey(name="Second Floor", elevation=6.0)
        wall = self.bim_env.create_entity(ifc_class="IfcWall")
        self.bim_env.assign_container(wall, storey)

        state = self.bim_env.get_current_state()
        self.assertTrue("Second Floor" in state)
        self.assertTrue("IfcWall" in state)


if __name__ == "__main__":
    unittest.main()
