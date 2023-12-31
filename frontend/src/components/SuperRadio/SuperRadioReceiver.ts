import { ref, watch } from "vue";

interface Settings {
  title: string;
  contents: Array<string>;
  aniDuration: number;
  mode: Mode;
  styles: {
    titleSize: number;
    contentSize: number;

    titleHorizonMargin: number;
    titleVerticalMargin: number;

    contentHorizonMargin: number;
    contentVerticalMargin: number;

    fullWidth: number;
    titleWidth: number;
    contentGap: number;
  }
}

enum Mode {
  Duplication,
  Single
}

class SuperRadioReceiverBuilder {
  private srr: SuperRadioReceiver;
  constructor() {
    this.srr = new SuperRadioReceiver();
  }

  setTitle(value: string) {
    this.srr.SRsettings.title = value;
    return this;
  }

  setContents(value: Array<string>) {
    this.srr.SRsettings.contents = value;
    return this;
  }

  setTitleSize(value: number) {
    this.srr.SRsettings.styles.titleSize = value;
    return this;
  }

  setContentSize(value: number) {
    this.srr.SRsettings.styles.contentSize = value;
    return this;
  }

  setTitleMargin(value: [number, number]) {
    this.srr.SRsettings.styles.titleHorizonMargin = value[0];
    this.srr.SRsettings.styles.titleVerticalMargin = value[1];
    return this;
  }

  setContentMargin(value: [number, number]) {
    this.srr.SRsettings.styles.contentHorizonMargin = value[0];
    this.srr.SRsettings.styles.contentVerticalMargin = value[1];
    return this;
  }

  setFullWidth(value: number) {
    this.srr.SRsettings.styles.fullWidth = value;
    return this;
  }

  setTitleWidth(value: number) {
    this.srr.SRsettings.styles.titleWidth = value;
    return this;
  }

  setContentGap(value: number) {
    this.srr.SRsettings.styles.contentGap = value;
    return this;
  }

  setAniDuration(value: number) {
    this.srr.SRsettings.aniDuration = value;
    return this;
  }

  setMode(value: Mode) {
    this.srr.SRsettings.mode = value;
    return this;
  }

  build() {
    return this.srr;
  }
}

class SuperRadioReceiver {
  private selectedItems = ref<Array<string>>([]);
  public SRsettings: Settings = {
    title: "[undefined title]",
    contents: ["[undefined contents]"],
    aniDuration: 0,
    mode: Mode.Duplication,
    styles: {
      titleSize: 60,
      contentSize: 50,

      titleHorizonMargin: 30,
      titleVerticalMargin: 0,

      contentHorizonMargin: 80,
      contentVerticalMargin: 20,

      fullWidth: -1,
      titleWidth: -1,
      contentGap: 20
    }
  }

  constructor(setting?: Settings) {
    if (setting !== undefined) {
      this.SRsettings = setting;
    }
    this.receiver = this.receiver.bind(this);
  }

  public get selected() {
    return this.selectedItems.value;
  }

  public get settings() {
    return this.SRsettings;
  }

  public receiver(value: Array<string>) {
    this.selectedItems.value = value;
  }

  public watchContents(prefix: string) {
    watch(this.selectedItems, newItem => {
      console.log(prefix, newItem);
    });
  }
}

export { Settings, SuperRadioReceiverBuilder, Mode };