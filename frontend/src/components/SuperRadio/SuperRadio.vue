<template>
  <div class="edge" ref="edgeR" :style="edgeStyle" :id="props.id">

    <div id="title" ref="titleR">
      <div id="titleItem">
        {{ props.settings.title }}
      </div>
    </div>

    <div
      id="barricade"
      ref="barricadeR"
      :style="[ absolutifyAndHeight, itemStyle(1) ]"
      :class="disableTransition"
    >
      <div id="barricadeItem"  />
    </div>
    

    <div id="itemParent" ref="itemParentR">
      <div
        id="itemPadding"
        v-for="(item, index) in props.settings.contents"
        :key="item"
        :style="[ absolutifyAndHeight, itemStyle(index + 2) ]"
        :class="disableTransition"
      >
        <div class="forFlex" :style="getBasicHeight">
          <div
            class="item"
            :class="itemClass(index)"
            :style="bgcOfItem(index + 2)"
            @click="select(index + 2)"
          >
            <div class="itemText">
              {{ item }}
            </div>
            <img
              class="x"
              :class="xClass(index)"
              src="images/x.svg"
              alt="x.svg" 
            />
          </div>
        </div>
        
      </div> 
    </div>
      
    <div
      id="allornot"
      ref="allornot"
      :style="[absolutifyAndHeight, allornotWidth]"
      v-show="props.settings.mode === Mode.Duplication"
    >
      <Transition name="slide-up">
        <div
          v-if="switcher"
          id="allornotItem"
          @click="selectAll"
          :style="absolutifyAndHeight"
        >
          <div class="forFlex" :style="getBasicHeight">
            모두 선택
          </div>
        </div>
        <div
          v-else
          id="allornotItem"
          @click="selectAll"
          :style="absolutifyAndHeight"
        >
          <div class="forFlex" :style="getBasicHeight">
            모두 해제
          </div>
        </div>
      </Transition>
      
    </div>

  </div>
</template>

<script lang="ts" setup>
  import { ref, computed,  onMounted, StyleValue, watch } from "vue";
  import { sum, moveElement } from "./_functions";
  import { Settings, Mode } from "./SuperRadioReceiver";

  interface Props {
    id?: string;
    settings: Settings;
  }
  type Html = HTMLElement;


   /* properties & emits zone */
  const props = defineProps<Props>();
  const emit = defineEmits<{
    receiver: [value: Array<string>]
}>()

  /* references zone */
  const widths = ref<number[]>(new Array);
  const order = ref<number[]>(new Array);
  const whoOnTop = ref(0);
  const absolute = ref(false);
  const basicHeight = ref(0);
  const basicWidth = ref(0);
  const transition = ref(false);
  const switcher = ref(true);

  /* HTML Elements zone */
  const edgeR = ref<Html>();
  const titleR = ref<Html>();
  const barricadeR = ref<Html>();
  const itemParentR = ref<Html>();
  const allornot = ref<Html>();

  /* computed zone */
  const itemStyle = computed(() => (locAtWidth: number) => {
    const locAtorder = order.value.indexOf(locAtWidth);
    const selectedCount = order.value.slice(1, indexOfBaricadeAtOrder()).length;
    const beforeMeCount = order.value.slice(1, isSelected(locAtWidth)).length;
    const additionalGap = (
      isSelected(locAtWidth) === -1 ? selectedCount : beforeMeCount
    ) * props.settings.styles.contentSize;

    const essential = {
      left: sum(
        order.value
          .slice(0, locAtorder)
          .map(v => widths.value[v])
      ) + additionalGap + "px",
    };
    const additional = {
      zIndex: (whoOnTop.value === locAtWidth) ? 2 : 1,
    };
    const forBari = {
      opacity: (selectedCount === widths.value.length - 3) ? 0 : 1
    }

    if (locAtWidth === 1) {
      return {
        ...essential,
        ...forBari
      };
    }
    return {
      ...essential,
      ...additional
    };
  });

  const bgcOfItem = computed(() => (locAtWidth: number) => {
    return {
      backgroundColor: ~isSelected(locAtWidth) ? "white" : "rgb(39, 40, 41)",
    }
  })

  const absolutifyAndHeight = computed(() => {
    return {
      position: absolute.value ? "absolute" : "static",
      height: basicHeight.value ? basicHeight.value + "px" : "auto"
    } as StyleValue;
  });

  const getBasicHeight = computed(() => {
    return {
      height: basicHeight.value + 'px'
    };
  });

  const edgeStyle = computed(() => {
    return {
      height: basicHeight.value ? basicHeight.value + 'px' : 'auto',
      width: (props.settings.styles.fullWidth === -1) ? 
        (basicWidth.value ? basicWidth.value + 'px' : '10000px'):
        props.settings.styles.fullWidth + "px"
    };
  });

  const disableTransition = computed(() => {
    return {
      disableTransition: !transition.value
    };
  });

  const allornotWidth = computed(() => {
    return {
      width: widths.value!.at(-1)! + 'px'
    };
  });

  const itemClass = computed(() => (index: number) => {
    return {
      blackify: !~isSelected(index + 2),  
      whitify: ~isSelected(index + 2),
      gapBigger: ~isSelected(index + 2)
    };
  });

  const xClass = computed(() => (index: number) => {
    return {
      xBigger: ~isSelected(index + 2)
    };
  });

  /* watch zone */
  watch(order, newOrder => {
    const count = newOrder.slice(1, indexOfBaricadeAtOrder()).length;
    if (count === props.settings.contents.length) {
      switcher.value = false;
    }
    if (count === 0) {
      switcher.value = true;
    }

    emit(
      "receiver",
      order.value
        .slice(1, indexOfBaricadeAtOrder())
        .map(v => props.settings.contents[v - 2])
    );
  }, { deep:true });

  /* functions zone */
  function isSelected(locAtWidth: number) {
    return order.value
      .slice(0, indexOfBaricadeAtOrder())
      .indexOf(locAtWidth);
  }

  function indexOfBaricadeAtOrder() {
    return order.value.indexOf(1);
  }

  function getWidth(element: Html | undefined) {
    return element!.clientWidth
  }

  /* eventListeners zone */
  function select(locAtWidth: number) {
    whoOnTop.value = locAtWidth;

    const indexAtorder = order.value.indexOf(locAtWidth);
    const selectedLen = order.value.slice(1, indexOfBaricadeAtOrder()).length;
    const modeIsSingle = props.settings.mode === Mode.Single;

    if (~isSelected(locAtWidth)) {
      /* 셀렉 된 걸 풀기 */
      let i: number;
      for (i = order.value.length; i > indexOfBaricadeAtOrder(); i--) {
        if (locAtWidth > order.value[i]) {
          break;
        }
      }
      moveElement(order.value, indexAtorder, i);

      setTimeout(() => {
        if (selectedLen - 1 === 0) {
          moveElement(order.value, indexOfBaricadeAtOrder() + 1, indexOfBaricadeAtOrder());
        }
      }, 300);
      
    } else {
      /* Mode.Single 일 때 선택된 거 삭제 */
      if (modeIsSingle && selectedLen !== 0) {
        let i: number;
        for (i = order.value.length; i > indexOfBaricadeAtOrder(); i--) {
          if (locAtWidth > order.value[i]) {
            break;
          }
        }
        moveElement(order.value, indexOfBaricadeAtOrder() - 1, i);
      }
      
      setTimeout(() => {
        /* 셀렉 안된 거 셀렉 */
        let i: number;
        for (i = 1; i < indexOfBaricadeAtOrder(); i++) {
          if (locAtWidth < order.value[i]) {
            break;
          }
        }
        moveElement(order.value, indexAtorder, i);
      }, (modeIsSingle ? (selectedLen ? 1 : 0) : 0) * 300);    
    }
  }

  function selectAll() {
    switcher.value = !switcher.value;
    if (switcher.value) {
      moveElement(order.value, indexOfBaricadeAtOrder(), 1);
      setTimeout(() => {
        const selectedLen = order.value.slice(1, indexOfBaricadeAtOrder()).length;
        if (selectedLen === 0) {
          moveElement(order.value, indexOfBaricadeAtOrder() + 1, indexOfBaricadeAtOrder());
        }
      }, 300);
    } else {
      moveElement(order.value, indexOfBaricadeAtOrder(), order.value.length - 2);
    }
  }

  /* hooks zone */
  function mount() {
    /* css variable 설정 */
    const edge = edgeR.value!.style;
    edge.setProperty("--titleSize", props.settings.styles.titleSize + "px");
    edge.setProperty("--contentSize", props.settings.styles.contentSize + "px");
    edge.setProperty("--titleHorizonMargin", props.settings.styles.titleHorizonMargin + "px");
    edge.setProperty("--titleVerticalMargin", props.settings.styles.titleVerticalMargin + "px");
    edge.setProperty("--contentHorizonMargin", props.settings.styles.contentHorizonMargin + "px");
    edge.setProperty("--contentVerticalMargin", props.settings.styles.contentVerticalMargin + "px");
    edge.setProperty("--fullWidth", props.settings.styles.fullWidth + "px");
    edge.setProperty("--titleWidth", props.settings.styles.titleWidth + "px");
    edge.setProperty("--contentGap", props.settings.styles.contentGap + "px");


    /* widths에 element 너비 삽입 */
    widths.value.push(getWidth(titleR.value));
    widths.value.push(getWidth(barricadeR.value));
    for (let itemR of itemParentR.value!.children) {
      widths.value.push(getWidth(itemR as Html));
    }
    widths.value.push(getWidth(allornot.value));

    /* 요소들 배치 순서 지정 */    
    for (let i = 0; i < widths.value.length; i++) {
      order.value.push(i);
    }

    basicHeight.value = Math.max(
      edgeR.value!.offsetHeight,
      (itemParentR.value!.children[0].children[0].children[0] as Html).offsetHeight
    );
    basicWidth.value = sum(widths.value) + props.settings.styles.contentSize * itemParentR.value!.children.length;

    /* okay 진행시켜 */
    absolute.value = true;
    setTimeout(() => {
      transition.value = true;
    });

    setTimeout(() => {
      moveElement(order.value, 2, 1);
    }, props.settings.aniDuration);
  }

  /* life cycles zone */
  onMounted(() => {
    mount();
  });
    
</script>

<style lang="scss">
  .disableTransition {
    transition: none !important;
  }

  .forFlex {
    display: flex;
    align-items: center;       
  }

  .slide-up-enter-from {
    opacity: 0;
    transform: translateY(30px);
  }

  .slide-up-leave-to {
    opacity: 0;
    transform: translateY(-30px);
  }

  .edge {
    --titleSize: 60px;
    --contentSize: 50px;
    
    --titleHorizonMargin: 30px;
    --titleVerticalMargin: 0px;

    --contentHorizonMargin: 80px;
    --contentVerticalMargin: 20px;

    --titleWidth: auto;
    --contentGap: 20px;

    font-size: var(--contentSize);
    font-family: 'SUIT';
    // border: 1px solid black;
    border-radius: 20px;
    display: flex;
    user-select: none;
    position: relative;
    color: white;

    #title {
      display: flex;
      align-items: center;
      padding-left: calc(var(--titleHorizonMargin) * 2);
      padding-right: var(--titleHorizonMargin);
      font-size: var(--titleSize);
      text-align: center;
      justify-content: center;
      width: var(--titleWidth);
      // border: 1px solid black;
    }

    #barricade {
      display: flex;
      transition: left .5s, opacity .5s;
      transition-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
      z-index: 3;
      padding-left: var(--titleHorizonMargin);
      padding-right: var(--titleHorizonMargin);
      // border: 1px solid black;
      #barricadeItem {  
        border-left: 3px solid white;
      }
    }

    #itemParent {
      display: flex;
      #itemPadding {
        // border: 1px solid black;
        padding-left: var(--contentGap);
        padding-right: var(--contentGap);
        transition: left .5s;
        .item {
          display: flex;
          border-radius: 1000px;
          transition: background-color .2s, gap .5s;
          transition-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
          top: 0;
          padding-top: var(--contentVerticalMargin);
          padding-bottom: var(--contentVerticalMargin);
          padding-left: var(--contentHorizonMargin);
          padding-right: var(--contentHorizonMargin);
          align-items: center;
          gap: 0px;

          .x {
            height: 0px;
            transition: height .35s;
            transition-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
          }

          .xBigger {
            height: calc(var(--contentSize) * .8);
          }
        }

        .gapBigger {
          gap: calc(var(--contentSize) * .4);
        }

        .blackify {
          color: white !important;
        }

        .whitify {
          color: rgb(24, 24, 25) !important;
        }

        @media (hover: hover) and (pointer: fine) {
          .blackify:hover {
            background-color: rgb(31, 32, 33) !important;
            cursor: grab;
          }

          .whitify:hover {
            background-color: rgb(227, 227, 227) !important;
            cursor: grab;
          }
        } 
      }
    }

    #allornot {
      align-items: center;
      padding-left: var(--contentVerticalMargin);
      padding-right: var(--contentVerticalMargin);
      right: 0;
      color: rgb(178, 178, 178);

      #allornotItem {
        border-radius: 15px;
        transition: opacity .5s, transform .5s;
        transition-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
      }

      @media (hover: hover) and (pointer: fine) {
        #allornotItem:hover {
          cursor: grab;
        }
      }
    }
  } 
</style>