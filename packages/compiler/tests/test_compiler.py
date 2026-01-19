"""Tests for BIML compiler."""

import pytest
from pathlib import Path
from compiler.ir import JsonIR, MeasurementIR
from compiler.ifc import compile_to_ifc

FIXTURES = Path(__file__).parent / "fixtures"


@pytest.fixture
def simple_ir():
    return JsonIR.from_file(str(FIXTURES / "simple.json"))


class TestIR:
    """Tests for IR parsing."""

    def test_parse_version(self, simple_ir):
        assert simple_ir.version == "1.0.0"

    def test_parse_libraries(self, simple_ir):
        assert len(simple_ir.libraries) == 1
        lib = simple_ir.libraries[0]
        assert lib.name == "Doors"

    def test_parse_materials(self, simple_ir):
        lib = simple_ir.libraries[0]
        assert len(lib.materials) == 2

        oak = lib.get_material("WarmOak")
        assert oak is not None
        assert oak.color is not None
        assert abs(oak.color.red - 0.76) < 0.01
        assert abs(oak.color.green - 0.60) < 0.01
        assert abs(oak.color.blue - 0.42) < 0.01

    def test_parse_types(self, simple_ir):
        """Test type definitions."""
        lib = simple_ir.libraries[0]
        # 3 types: Door (base), SingleDoor, InteriorDoor
        assert len(lib.types) == 3

        # Base Door type should have parameters
        door_type = lib.get_type("Door")
        assert door_type is not None
        assert len(door_type.parameters) == 3

        # SingleDoor inherits from Door
        single_door = lib.get_type("SingleDoor")
        assert single_door is not None
        assert single_door.base_type == "Door"
        assert single_door.material == "WarmOak"

    def test_type_parameters(self, simple_ir):
        """Test parameter definitions on base type."""
        door_type = simple_ir.get_type("Door")
        assert door_type is not None
        assert len(door_type.parameters) == 3

        width_param = next(p for p in door_type.parameters if p.name == "width")
        assert width_param is not None
        assert width_param.type == "Length"
        assert width_param.default_value is not None

    def test_type_overrides(self, simple_ir):
        """Test parameter overrides on derived type."""
        interior_door = simple_ir.get_type("InteriorDoor")
        assert interior_door is not None
        assert "width" in interior_door.overrides

        width_override = interior_door.overrides["width"]
        result = width_override.evaluate()
        assert isinstance(result, MeasurementIR)
        assert result.value == 800

    def test_get_type_parameter_value(self, simple_ir):
        """Test get_parameter_value method with inheritance resolution."""
        resolved = simple_ir.resolve_type_inheritance(simple_ir.get_type("SingleDoor"))

        # SingleDoor inherits width from Door
        width = resolved.get_parameter_value("width")
        assert width is not None
        assert isinstance(width, MeasurementIR)
        assert width.value == 900

    def test_type_inheritance_resolution(self, simple_ir):
        """Test that type inheritance is properly resolved."""
        interior_door = simple_ir.get_type("InteriorDoor")
        resolved = simple_ir.resolve_type_inheritance(interior_door)

        # Should have inherited parameters from Door
        assert len(resolved.parameters) == 3

        # Override should take precedence
        width = resolved.get_parameter_value("width")
        assert width.value == 800  # Overridden value

    def test_parse_building(self, simple_ir):
        assert len(simple_ir.buildings) == 1
        building = simple_ir.buildings[0]
        assert building.name == "Simple Office"

    def test_parse_defaults(self, simple_ir):
        building = simple_ir.buildings[0]
        assert building.defaults is not None
        assert building.defaults.wall_thickness is not None
        assert building.defaults.wall_thickness.to_meters() == 0.2

    def test_parse_level(self, simple_ir):
        level = simple_ir.buildings[0].levels[0]
        assert level.name == "Ground"
        assert level.elevation.value is not None
        assert level.elevation.value.to_meters() == 0
        assert level.height is not None
        assert level.height.to_meters() == 3.5

    def test_parse_walls(self, simple_ir):
        level = simple_ir.buildings[0].levels[0]
        assert len(level.walls) == 5

        north_wall = next(w for w in level.walls if w.name == "North")
        assert north_wall.start.x == 0
        assert north_wall.start.y == 10
        assert north_wall.end.x == 15
        assert north_wall.end.y == 10
        assert abs(north_wall.length() - 15) < 0.01

    def test_parse_spaces(self, simple_ir):
        level = simple_ir.buildings[0].levels[0]
        assert len(level.spaces) == 2

        reception = next(s for s in level.spaces if s.name == "Reception")
        assert "public" in reception.tags
        assert "reception" in reception.tags

    def test_parse_doors(self, simple_ir):
        level = simple_ir.buildings[0].levels[0]
        reception = next(s for s in level.spaces if s.name == "Reception")

        assert len(reception.doors) == 1
        main_entry = reception.doors[0]
        assert main_entry.name == "Main Entry"
        assert main_entry.type_ref == "SingleDoor"
        assert main_entry.wall == "South"
        assert main_entry.swing == "outward"

    def test_parse_door_position(self, simple_ir):
        level = simple_ir.buildings[0].levels[0]
        reception = next(s for s in level.spaces if s.name == "Reception")
        main_entry = reception.doors[0]

        assert main_entry.position.kind == "absolute"
        assert main_entry.position.value.to_meters() == 4.0

    def test_parse_door_connects(self, simple_ir):
        level = simple_ir.buildings[0].levels[0]
        office = next(s for s in level.spaces if s.name == "Office")
        office_door = office.doors[0]

        assert office_door.connects is not None
        assert office_door.connects.from_space == "Reception"
        assert office_door.connects.to_space == "Office"


class TestIFCGeneration:
    """Tests for IFC generation."""

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

    def test_creates_building(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        buildings = ifc.by_type("IfcBuilding")
        assert len(buildings) == 1
        assert buildings[0].Name == "Simple Office"

    def test_creates_storey(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        storeys = ifc.by_type("IfcBuildingStorey")
        assert len(storeys) == 1
        assert storeys[0].Name == "Ground"
        assert storeys[0].Elevation == 0.0

    def test_creates_walls(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        walls = ifc.by_type("IfcWall")
        # 5 walls: North, East, South, West, Interior
        assert len(walls) == 5

        wall_names = {w.Name for w in walls}
        assert "North" in wall_names
        assert "East" in wall_names
        assert "South" in wall_names
        assert "West" in wall_names
        assert "Interior" in wall_names

    def test_creates_doors(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        doors = ifc.by_type("IfcDoor")
        # 2 doors: Main Entry, Office Door
        assert len(doors) == 2

        door_names = {d.Name for d in doors}
        assert "Main Entry" in door_names
        assert "Office Door" in door_names

    def test_creates_openings(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        openings = ifc.by_type("IfcOpeningElement")
        # 1 opening per door = 2 openings
        assert len(openings) == 2

    def test_creates_door_types(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        door_types = ifc.by_type("IfcDoorType")
        # No IfcDoorType entities are created for simple fixture
        assert len(door_types) == 0

    def test_creates_void_relationships(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        voids = ifc.by_type("IfcRelVoidsElement")
        openings = ifc.by_type("IfcOpeningElement")
        assert len(voids) == len(openings)

    def test_creates_fill_relationships(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        fills = ifc.by_type("IfcRelFillsElement")
        doors = ifc.by_type("IfcDoor")
        assert len(fills) == len(doors)

    def test_creates_type_relationships(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        type_rels = ifc.by_type("IfcRelDefinesByType")
        doors = ifc.by_type("IfcDoor")
        assert len(type_rels) == 0
        assert len(doors) == 2

    def test_empty_buildings_raises(self):
        ir = JsonIR(version="1.0.0", libraries=[], buildings=[])
        with pytest.raises(ValueError, match="No buildings"):
            compile_to_ifc(ir)


class TestMaterialStyles:
    """Tests for material/style generation."""

    def test_creates_surface_styles(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        styles = ifc.by_type("IfcSurfaceStyle")
        # 2 materials = 2 styles
        assert len(styles) == 2

        style_names = {s.Name for s in styles}
        assert "WarmOak" in style_names
        assert "WhitePaint" in style_names

    def test_creates_color_rgb(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        colors = ifc.by_type("IfcColourRgb")
        assert len(colors) == 2

    def test_style_has_correct_color(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        styles = ifc.by_type("IfcSurfaceStyle")

        oak_style = next(s for s in styles if s.Name == "WarmOak")
        shading = oak_style.Styles[0]
        color = shading.SurfaceColour

        assert abs(color.Red - 0.76) < 0.01
        assert abs(color.Green - 0.60) < 0.01
        assert abs(color.Blue - 0.42) < 0.01

    def test_doors_have_styles(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        styled_items = ifc.by_type("IfcStyledItem")
        doors = ifc.by_type("IfcDoor")
        # Each door with material gets styled
        assert len(styled_items) == len(doors)


class TestWallGeometry:
    """Tests for wall geometry calculation."""

    def test_wall_endpoints(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        walls = ifc.by_type("IfcWall")

        # Find the north wall
        north_wall = next(w for w in walls if w.Name == "North")
        assert north_wall.Representation is not None

    def test_wall_has_extruded_solid(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        walls = ifc.by_type("IfcWall")

        for wall in walls:
            assert wall.Representation is not None
            body_rep = next(
                r
                for r in wall.Representation.Representations
                if r.RepresentationIdentifier == "Body"
            )
            assert body_rep.RepresentationType == "SweptSolid"


class TestDoorPlacement:
    """Tests for door placement in walls."""

    def test_door_height_matches_type(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        doors = ifc.by_type("IfcDoor")

        main_entry = next(d for d in doors if d.Name == "Main Entry")
        # Height should be 2.1m (from inherited Door type, 2100mm)
        assert abs(main_entry.OverallHeight - 2.1) < 0.01

    def test_door_width_matches_type(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        doors = ifc.by_type("IfcDoor")

        main_entry = next(d for d in doors if d.Name == "Main Entry")
        # Width should be 0.9m (from inherited Door type)
        assert abs(main_entry.OverallWidth - 0.9) < 0.01

        office_door = next(d for d in doors if d.Name == "Office Door")
        # Width should be 0.8m (InteriorDoor type override)
        assert abs(office_door.OverallWidth - 0.8) < 0.01


class TestTypeInheritance:
    """Tests for type inheritance resolution."""

    def test_single_level_inheritance(self, simple_ir):
        """Test SingleDoor inheriting from Door."""
        single_door = simple_ir.get_type("SingleDoor")
        resolved = simple_ir.resolve_type_inheritance(single_door)

        assert resolved.base_type == "Door"
        assert len(resolved.parameters) == 3  # Inherited from Door
        assert resolved.material == "WarmOak"

    def test_override_in_child(self, simple_ir):
        """Test InteriorDoor overriding Door's width."""
        interior_door = simple_ir.get_type("InteriorDoor")
        resolved = simple_ir.resolve_type_inheritance(interior_door)

        width = resolved.get_parameter_value("width")
        assert width.value == 800  # Overridden

        height = resolved.get_parameter_value("height")
        assert height.value == 2100  # Inherited default
