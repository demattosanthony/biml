CXX = g++
CXXFLAGS = -std=c++17 -DBOOST_BIND_GLOBAL_PLACEHOLDERS
INCLUDES = -I/Users/anthonydemattos/IfcOpenshell/src -I/opt/homebrew/Cellar/boost/1.87.0/include
LDFLAGS = -L/Users/anthonydemattos/IfcOpenshell/build
LIBS = -lIfcParse -lIfcGeom

all: test

test: test.cpp
	$(CXX) $(CXXFLAGS) $(INCLUDES) $(LDFLAGS) $< $(LIBS) -o $@

clean:
	rm -f test
