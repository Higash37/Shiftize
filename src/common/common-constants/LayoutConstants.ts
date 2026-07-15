

export type LayoutType = {
  padding: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
  borderRadius: {
    none: number;
    small: number;
    medium: number;
    large: number;
    xlarge: number;
    xxlarge: number;
    full: number;
  };

  headerFooter: {
    borderRadius: {
      header: number;
      footer: number;
    };
  };

  components: {
    card: number;
    button: number;
    input: number;
    modal: number;
    chip: number;
    avatar: number;
    listItem: number;
    tab: number;
    notification: number;
  };

  special: {
    welcome: number;
    hero: number;
    feature: number;
  };
};

export const layout: LayoutType = {
  padding: {
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
  },
  borderRadius: {
    none: 0,
    small: 6,
    medium: 12,
    large: 18,
    xlarge: 24,
    xxlarge: 32,
    full: 9999,
  },

  headerFooter: {
    borderRadius: {
      header: 18,
      footer: 18,
    },
  },

  components: {
    card: 16,
    button: 12,
    input: 10,
    modal: 20,
    chip: 16,
    avatar: 8,
    listItem: 12,
    tab: 8,
    notification: 12,
  },

  special: {
    welcome: 20,
    hero: 24,
    feature: 18,
  },
};
