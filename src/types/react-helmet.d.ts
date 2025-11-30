declare module 'react-helmet' {
  import * as React from 'react';

  interface HelmetProps {
    children?: React.ReactNode;
    title?: string;
    defaultTitle?: string;
    titleTemplate?: string;
    base?: { target?: string; href?: string };
    meta?: Array<{
      name?: string;
      property?: string;
      content?: string;
      httpEquiv?: string;
      charset?: string;
    }>;
    link?: Array<{
      rel?: string;
      href?: string;
      hreflang?: string;
      type?: string;
      sizes?: string;
      crossOrigin?: string;
    }>;
    script?: Array<{
      type?: string;
      src?: string;
      innerHTML?: string;
    }>;
    noscript?: Array<{ innerHTML?: string }>;
    style?: Array<{ type?: string; cssText?: string }>;
    onChangeClientState?: (newState: any, addedTags: any, removedTags: any) => void;
  }

  export class Helmet extends React.Component<HelmetProps> {}
}

