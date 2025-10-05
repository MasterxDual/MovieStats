/// <reference types="vite/client" />

/**
 * El cambio que hice agrega una declaración de módulo de TypeScript para archivos .vue en el archivo env.d.ts. 
 * Esto le dice a TypeScript cómo manejar las importaciones de componentes de Vue de un solo archivo.
 * En proyectos de Vue 3 con TypeScript, los archivos .vue no son entendidos nativamente por TypeScript, por lo 
 * que sin esta declaración, TypeScript los trata como si tuvieran un tipo implícito any, causando el error que viste.
 * La declaración define que cualquier módulo que termine en .vue exporta un DefineComponent de Vue, permitiendo un 
 * tipado correcto para importaciones dinámicas como la del router.
 * 
 * En produccion quitar esto, ya que solo sirve para rutear la pagina de Registro como pagina de inicio
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
