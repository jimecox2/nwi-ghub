// Required by @next/mdx in the App Router. Lets you map MDX elements to
// custom components. The defaults below are fine because the shared layout
// already wraps page content in a Tailwind `prose` container.
export function useMDXComponents(components) {
  return {
    ...components,
  };
}
