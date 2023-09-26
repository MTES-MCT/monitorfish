declare module '*.svg' {
  const content: React.FC<React.SVGProps<SVGElement>>

  // eslint-disable-next-line import/no-default-export
  export default content
}
