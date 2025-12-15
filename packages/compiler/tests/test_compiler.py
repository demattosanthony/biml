"""Tests for BIM compiler (v0.6.0 with ceilings)."""

import pytest
from pathlib import Path
from compiler.ir import JsonIR
from compiler.ifc import compile_to_ifc

FIXTURES = Path(__file__).parent / "fixtures"


@pytest.fixture
def simple_ir():
    return JsonIR.from_file(FIXTURES / "simple.json")


class TestIR:
    def test_parse_simple_json(self, simple_ir):
        assert simple_ir.version == "0.6.0"
        assert len(simple_ir.libraries) == 1
        assert len(simple_ir.projects) == 1

    def test_parse_library(self, simple_ir):
        lib = simple_ir.libraries[0]
        assert lib.name == "Doors"
        assert len(lib.families) == 1
        assert lib.families[0].name == "Door"
        assert len(lib.families[0].parameters) == 2

    def test_parse_materials(self, simple_ir):
        lib = simple_ir.libraries[0]
        assert len(lib.materials) == 3

        oak = lib.get_material("WarmOak")
        assert oak is not None
        assert oak.color.red == 0.76
        assert oak.color.green == 0.60
        assert oak.color.blue == 0.42

        walnut = lib.get_material("DarkWalnut")
        assert walnut is not None
        assert walnut.color.red == 0.40

    def test_parse_types(self, simple_ir):
        lib = simple_ir.libraries[0]
        assert len(lib.types) == 3
        door_type = lib.types[0]
        assert door_type.name == "StandardDoor"
        assert door_type.family == "Door"
        assert door_type.material == "WarmOak"
        assert len(door_type.parameters) == 2

    def test_get_type(self, simple_ir):
        door_type = simple_ir.get_type("StandardDoor")
        assert door_type is not None
        assert door_type.name == "StandardDoor"

        width = door_type.get_parameter("width")
        assert width is not None
        assert width.value == 900

    def test_get_material(self, simple_ir):
        mat = simple_ir.get_material("WarmOak")
        assert mat is not None
        assert mat.name == "WarmOak"
        assert mat.color is not None

    def test_parse_project(self, simple_ir):
        project = simple_ir.projects[0]
        assert project.name == "Simple Office"
        assert len(project.sites) == 1

    def test_parse_building_hierarchy(self, simple_ir):
        project = simple_ir.projects[0]
        site = project.sites[0]
        assert site.name == "Main Site"
        assert len(site.buildings) == 1

        building = site.buildings[0]
        assert building.name == "Office Building"
        assert len(building.levels) == 1

    def test_parse_level(self, simple_ir):
        level = simple_ir.projects[0].sites[0].buildings[0].levels[0]
        assert level.name == "Ground"
        assert level.elevation.value == 0
        assert level.height.value == 3.5
        assert len(level.spaces) == 2

    def test_parse_spaces(self, simple_ir):
        spaces = simple_ir.projects[0].sites[0].buildings[0].levels[0].spaces
        assert len(spaces) == 2

        reception = spaces[0]
        assert reception.name == "Reception"
        assert reception.position.row == 0
        assert reception.position.col == 0
        assert reception.area.value == 50
        assert len(reception.doors) == 1

        hallway = spaces[1]
        assert hallway.name == "Hallway"
        assert hallway.position.row == 0
        assert hallway.position.col == 1
        assert hallway.width.value == 2
        assert hallway.length.value == 10

    def test_parse_doors(self, simple_ir):
        door = simple_ir.projects[0].sites[0].buildings[0].levels[0].spaces[0].doors[0]
        assert door.name == "Main Entry"
        assert door.type_ref == "StandardDoor"


class TestIFCGeneration:
    def test_generates_ifc_file(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        assert ifc is not None
        assert ifc.schema == "IFC4"

    def test_creates_project(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        projects = ifc.by_type("IfcProject")
        assert len(projects) == 1
        assert projects[0].Name == "Simple Office"

    def test_creates_site(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        sites = ifc.by_type("IfcSite")
        assert len(sites) == 1
        assert sites[0].Name == "Main Site"

    def test_creates_building(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        buildings = ifc.by_type("IfcBuilding")
        assert len(buildings) == 1
        assert buildings[0].Name == "Office Building"

    def test_creates_storey(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        storeys = ifc.by_type("IfcBuildingStorey")
        assert len(storeys) == 1
        assert storeys[0].Name == "Ground"
        assert storeys[0].Elevation == 0.0

    def test_creates_walls_slabs_and_ceilings(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        walls = ifc.by_type("IfcWall")
        slabs = ifc.by_type("IfcSlab")
        ceilings = ifc.by_type("IfcCovering")
        # With shared wall handling, we should have fewer walls
        # 2 rooms adjacent = 7 walls (3 exterior each + 1 shared)
        assert len(walls) == 7
        # 1 floor slab per room × 2 rooms = 2 slabs
        assert len(slabs) == 2
        assert any("Reception - Floor" in s.Name for s in slabs)
        assert any("Hallway - Floor" in s.Name for s in slabs)
        # 1 ceiling per room
        assert len(ceilings) == 2
        assert all(c.PredefinedType == "CEILING" for c in ceilings)
        # Ceilings sit at height minus their thickness
        level = simple_ir.projects[0].sites[0].buildings[0].levels[0]
        expected_base = level.height.to_meters() - level.ceiling_thickness.to_meters()
        z_positions = [
            c.ObjectPlacement.RelativePlacement.Location.Coordinates[2]
            for c in ceilings
        ]
        assert all(z == pytest.approx(expected_base) for z in z_positions)

    def test_creates_doors(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        openings = ifc.by_type("IfcOpeningElement")
        doors = ifc.by_type("IfcDoor")
        # 2 exterior doors (Main Entry, D2) - D1 is interior and may not place
        assert len(openings) >= 2
        assert len(doors) >= 2
        door_names = {d.Name for d in doors}
        assert "Main Entry" in door_names
        assert "D2" in door_names

    def test_creates_door_types(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        door_types = ifc.by_type("IfcDoorType")
        assert len(door_types) == 3
        type_names = {t.Name for t in door_types}
        assert "StandardDoor" in type_names
        assert "InteriorDoor" in type_names
        assert "WalnutDoor" in type_names

    def test_creates_type_relationships(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        type_rels = ifc.by_type("IfcRelDefinesByType")
        doors = ifc.by_type("IfcDoor")
        # Each door should be linked to its type
        assert len(type_rels) == len(doors)

    def test_creates_void_relationships(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        voids = ifc.by_type("IfcRelVoidsElement")
        openings = ifc.by_type("IfcOpeningElement")
        # Each opening creates 1 void relationship
        assert len(voids) == len(openings)

    def test_creates_fill_relationships(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        fills = ifc.by_type("IfcRelFillsElement")
        doors = ifc.by_type("IfcDoor")
        # Each door fills 1 opening
        assert len(fills) == len(doors)

    def test_empty_projects_raises(self):
        ir = JsonIR(version="0.6.0", libraries=[], projects=[])
        with pytest.raises(ValueError, match="No projects"):
            compile_to_ifc(ir)


class TestMaterialStyles:
    """Tests for material/style generation in IFC output."""

    def test_creates_surface_styles(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        styles = ifc.by_type("IfcSurfaceStyle")
        # 3 materials = 3 styles
        assert len(styles) == 3
        style_names = {s.Name for s in styles}
        assert "WarmOak" in style_names
        assert "DarkWalnut" in style_names
        assert "WhitePainted" in style_names

    def test_creates_color_rgb(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        colors = ifc.by_type("IfcColourRgb")
        # 3 materials = 3 colors
        assert len(colors) == 3

    def test_style_has_correct_color(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        styles = ifc.by_type("IfcSurfaceStyle")

        oak_style = next(s for s in styles if s.Name == "WarmOak")
        shading = oak_style.Styles[0]  # IfcSurfaceStyleShading
        color = shading.SurfaceColour
        # Check oak color values (0.76, 0.60, 0.42)
        assert abs(color.Red - 0.76) < 0.01
        assert abs(color.Green - 0.60) < 0.01
        assert abs(color.Blue - 0.42) < 0.01

    def test_styled_items_created(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        styled_items = ifc.by_type("IfcStyledItem")
        doors = ifc.by_type("IfcDoor")
        # Each door with material gets a styled item
        assert len(styled_items) == len(doors)

    def test_door_has_style_applied(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        doors = ifc.by_type("IfcDoor")

        # Find Main Entry door (uses StandardDoor with WarmOak)
        main_entry = next(d for d in doors if d.Name == "Main Entry")
        assert main_entry.Representation is not None

        # Check that the door's body representation has a styled item
        body_rep = next(
            r for r in main_entry.Representation.Representations
            if r.RepresentationIdentifier == "Body"
        )
        # The geometry item should have a style applied via IfcStyledItem
        styled_items = ifc.by_type("IfcStyledItem")
        geometry_items = set(body_rep.Items)
        # At least one styled item should reference our geometry
        assert any(si.Item in geometry_items for si in styled_items)
