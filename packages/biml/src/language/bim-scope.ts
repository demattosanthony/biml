import type {
  AstNode,
  AstNodeDescription,
  ReferenceInfo,
  Scope,
} from "langium";
import {
  AstUtils,
  DefaultScopeProvider,
  MapScope,
} from "langium";
import type { Model } from "../generated/ast";
import { isModel } from "../generated/ast";

/**
 * Custom ScopeProvider for BIML.
 *
 * Provides global visibility for Types and Materials across all libraries.
 * This is necessary because:
 * - Types defined in libraries need to be visible to doors, windows, furniture, columns in buildings
 * - Materials defined in libraries need to be visible to walls, slabs, and type definitions
 * - Type inheritance (baseType) needs to see types from all libraries
 */
export class BimScopeProvider extends DefaultScopeProvider {
  override getScope(context: ReferenceInfo): Scope {
    // Get the reference type from the grammar
    const referenceType = this.reflection.getReferenceType(context);

    // Handle Type references globally
    if (referenceType === "Type") {
      return this.getGlobalTypeScope(context.container);
    }

    // Handle Material references globally
    if (referenceType === "Material") {
      return this.getGlobalMaterialScope(context.container);
    }

    // For all other references, use default scoping
    return super.getScope(context);
  }

  /**
   * Creates a global scope containing all Types from all Libraries in the Model.
   */
  private getGlobalTypeScope(node: AstNode): Scope {
    const model = this.getModel(node);
    if (!model) {
      return new MapScope([]);
    }

    const descriptions: AstNodeDescription[] = [];
    const document = AstUtils.getDocument(node);

    for (const library of model.libraries) {
      for (const type of library.types) {
        descriptions.push({
          node: type,
          name: type.name,
          type: "Type",
          documentUri: document.uri,
          path: this.getNodePath(type),
        });
      }
    }

    return new MapScope(descriptions);
  }

  /**
   * Creates a global scope containing all Materials from all Libraries in the Model.
   */
  private getGlobalMaterialScope(node: AstNode): Scope {
    const model = this.getModel(node);
    if (!model) {
      return new MapScope([]);
    }

    const descriptions: AstNodeDescription[] = [];
    const document = AstUtils.getDocument(node);

    for (const library of model.libraries) {
      for (const material of library.materials) {
        descriptions.push({
          node: material,
          name: material.name,
          type: "Material",
          documentUri: document.uri,
          path: this.getNodePath(material),
        });
      }
    }

    return new MapScope(descriptions);
  }

  /**
   * Traverses up the AST to find the root Model node.
   */
  private getModel(node: AstNode): Model | undefined {
    let current: AstNode | undefined = node;
    while (current) {
      if (isModel(current)) {
        return current;
      }
      current = current.$container;
    }
    return undefined;
  }

  /**
   * Gets the path to a node for the AstNodeDescription.
   */
  private getNodePath(node: AstNode): string {
    const segments: string[] = [];
    let current: AstNode | undefined = node;

    while (current && current.$container) {
      const containerProperty = current.$containerProperty;
      const containerIndex = current.$containerIndex;

      if (containerProperty) {
        if (containerIndex !== undefined) {
          segments.unshift(`${containerProperty}@${containerIndex}`);
        } else {
          segments.unshift(containerProperty);
        }
      }

      current = current.$container;
    }

    return segments.join("/");
  }
}
