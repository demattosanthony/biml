#include <iostream>
#include <ifcparse/IfcFile.h>
#include <ifcparse/IfcHierarchyHelper.h>

int main() {
    std::string filename = "../train/dataset/Architectural_Updated.ifc";
    
    try {
        IfcParse::IfcFile file(filename);
        
        if (!file.good()) {
            std::cerr << "Unable to parse IFC file" << std::endl;
            return 1;
        }

        // Get all walls as an example
        auto walls = file.instances_by_type("IfcWall");
        std::cout << "Found " << walls->size() << " walls in the model" << std::endl;

    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }

    return 0;
}
