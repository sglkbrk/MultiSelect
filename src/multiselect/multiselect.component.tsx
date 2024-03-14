// @ts-nocheck
import React, { useRef, useEffect } from "react";
import "./styles.css";
import CloseCircleDark from "../assets/svg/closeCircleDark.svg";
import DownArrow from "../assets/svg/downArrow.svg";
import { IMultiselectProps } from "./interface";

function useOutsideAlerter(ref, clickEvent) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        clickEvent();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}

function OutsideAlerter(props) {
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, props.outsideClick);
  return <div ref={wrapperRef}>{props.children}</div>;
}

export class Multiselect extends React.Component<IMultiselectProps, any> {
  static defaultProps: IMultiselectProps;
  constructor(props) {
    super(props);
    this.state = {
      inputValue: "",
      items: props.items,
      filteredOptions: props.items,
      unfilteredOptions: props.items,
      selectedItems: Object.assign([], props.selectedItems),
      preSelectedValues: Object.assign([], props.selectedItems),
      toggleOptionsList: false,
      highlightOption: 0,
      groupedObject: [],
      closeIconType: CloseCircleDark,
    };
    this.optionTimeout = null;
    this.searchWrapper = React.createRef();
    this.searchBox = React.createRef();
    this.onChange = this.onChange.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.renderMultiselectContainer =
      this.renderMultiselectContainer.bind(this);
    this.renderSelectedList = this.renderSelectedList.bind(this);
    this.searchValueColorAndBold = this.searchValueColorAndBold.bind(this);
    this.onRemoveSelectedItem = this.onRemoveSelectedItem.bind(this);
    this.toggelOptionList = this.toggelOptionList.bind(this);
    this.onArrowKeyNavigation = this.onArrowKeyNavigation.bind(this);
    this.onSelectItem = this.onSelectItem.bind(this);
    this.filterOptionsInput = this.filterOptionsInput.bind(this);
    this.removeSelectedValues = this.removeSelectedValues.bind(this);
    this.isSelectedValue = this.isSelectedValue.bind(this);
    this.fadeOutSelection = this.fadeOutSelection.bind(this);
    this.isDisablePreSelectedValues =
      this.isDisablePreSelectedValues.bind(this);
    this.renderOption = this.renderOption.bind(this);
    this.listenerCallback = this.listenerCallback.bind(this);
    this.resetSelectedValues = this.resetSelectedValues.bind(this);
    this.getSelectedItems = this.getSelectedItems.bind(this);
    this.getSelectedItemsCount = this.getSelectedItemsCount.bind(this);
    this.hideOnClickOutside = this.hideOnClickOutside.bind(this);
    this.onCloseOptionList = this.onCloseOptionList.bind(this);
    this.isVisible = this.isVisible.bind(this);
  }

  initialSetValue() {
    this.removeSelectedValues(false);
  }

  resetSelectedValues() {
    const { unfilteredOptions } = this.state;
    return new Promise((resolve) => {
      this.setState(
        {
          selectedItems: [],
          preSelectedValues: [],
          items: unfilteredOptions,
          filteredOptions: unfilteredOptions,
        },
        () => {
          resolve();
          this.initialSetValue();
        }
      );
    });
  }

  getSelectedItems() {
    return this.state.selectedItems;
  }

  getSelectedItemsCount() {
    return this.state.selectedItems.length;
  }

  componentDidMount() {
    this.initialSetValue();
    this.searchWrapper.current.addEventListener("click", this.listenerCallback);
  }

  componentDidUpdate(prevProps) {
    const { items, selectedItems } = this.props;
    const { items: prevOptions, selectedItems: prevSelectedvalues } = prevProps;
    if (JSON.stringify(prevOptions) !== JSON.stringify(items)) {
      this.setState(
        { items, filteredOptions: items, unfilteredOptions: items },
        this.initialSetValue
      );
    }
    if (JSON.stringify(prevSelectedvalues) !== JSON.stringify(selectedItems)) {
      this.setState(
        {
          selectedItems: Object.assign([], selectedItems),
          preSelectedValues: Object.assign([], selectedItems),
        },
        this.initialSetValue
      );
    }
  }

  listenerCallback() {
    this.searchBox.current.focus();
  }

  componentWillUnmount() {
    if (this.optionTimeout) {
      clearTimeout(this.optionTimeout);
    }
    this.searchWrapper.current.removeEventListener(
      "click",
      this.listenerCallback
    );
  }

  removeSelectedValues(bool) {
    const { variableName } = this.props;
    const { selectedItems = [], unfilteredOptions } = this.state;
    if (!selectedItems.length && !bool) {
      return;
    }
    if (true) {
      let optionList = unfilteredOptions.filter((item) => {
        return selectedItems.findIndex(
          (v) => v[variableName] === item[variableName]
        ) === -1
          ? true
          : false;
      });
      this.setState(
        { items: optionList, filteredOptions: optionList },
        this.filterOptionsInput
      );
      return;
    }
  }

  onChange(event) {
    const { onSearch } = this.props;
    this.setState({ inputValue: event.target.value }, this.filterOptionsInput);
    if (onSearch) {
      onSearch(event.target.value);
    }
  }

  onKeyPress(event) {
    const { onKeyPressFn } = this.props;
    if (onKeyPressFn) {
      onKeyPressFn(event, event.target.value);
    }
  }

  filterOptionsInput() {
    let { items, filteredOptions, inputValue } = this.state;
    const { variableName } = this.props;
    items = filteredOptions.filter((i) =>
      this.matchValues(i[variableName], inputValue)
    );
    this.setState({ items });
  }

  matchValues(value, search) {
    if (value.toLowerCase)
      return value.toLowerCase().indexOf(search.toLowerCase()) > -1;
  }

  // Ok Tuşuyla Gezinme
  onArrowKeyNavigation(e) {
    const {
      items,
      highlightOption,
      toggleOptionsList,
      inputValue,
      selectedItems,
    } = this.state;
    if (e.keyCode === 8 && !inputValue && selectedItems.length) {
      this.onRemoveSelectedItem(selectedItems.length - 1);
    }
    if (!items.length) {
      return;
    }
    if (e.keyCode === 38) {
      if (highlightOption > 0) {
        this.setState((previousState) => ({
          highlightOption: previousState.highlightOption - 1,
        }));
      } else {
        this.setState({ highlightOption: items.length - 1 });
      }
    } else if (e.keyCode === 40) {
      if (highlightOption < items.length - 1) {
        this.setState((previousState) => ({
          highlightOption: previousState.highlightOption + 1,
        }));
      } else {
        this.setState({ highlightOption: 0 });
      }
    } else if (e.key === "Enter" && items.length && toggleOptionsList) {
      if (highlightOption === -1) {
        return;
      }
      this.onSelectItem(items[highlightOption]);
    }
    setTimeout(() => {
      const element = document.querySelector("ul.optionContainer .highlight");
      if (element) {
        element.scrollIntoView();
      }
    });
  }

  onRemoveSelectedItem(item) {
    let { selectedItems, index = 0 } = this.state;
    const { onRemove, variableName } = this.props;
    index = selectedItems.findIndex(
      (i) => i[variableName] === item[variableName]
    );
    selectedItems.splice(index, 1);
    onRemove(selectedItems, item);
    this.setState({ selectedItems }, () => {});
  }

  onSelectItem(item) {
    const { selectedItems } = this.state;
    const { selectionMaxLimit, onSelect } = this.props;
    // TODO: Parameterize
    if (true) {
      this.setState({
        inputValue: "",
      });
    }
    if (this.isSelectedValue(item)) {
      this.onRemoveSelectedItem(item);
      return;
    }
    if (selectionMaxLimit == selectedItems.length) {
      return;
    }
    selectedItems.push(item);
    onSelect(selectedItems, item);
    this.setState({ selectedItems }, () => {
      this.filterOptionsInput();
    });
  }

  isSelectedValue(item) {
    const { variableName } = this.props;
    const { selectedItems } = this.state;
    return (
      selectedItems.filter((i) => i[variableName] === item[variableName])
        .length > 0
    );
  }

  renderList() {
    const { nodata, loading, loadingMessage = "loading..." } = this.props;
    const { items } = this.state;
    if (loading) {
      return (
        <ul className={`optionContainer`}>
          {typeof loadingMessage === "string" && (
            <span className={`notFound`}>{loadingMessage}</span>
          )}
          {typeof loadingMessage !== "string" && loadingMessage}
        </ul>
      );
    }
    return (
      <ul className={`optionContainer`}>
        {items.length === 0 && <span className={`notFound`}>{nodata}</span>}
        {this.renderOption()}
      </ul>
    );
  }

  renderOption() {
    const { variableName } = this.props;
    const { highlightOption } = this.state;
    return this.state.items.map((option, i) => {
      const isSelected = this.isSelectedValue(option);
      return (
        <li
          key={`option${i}`}
          className={`option ${isSelected ? "selected" : ""} ${
            highlightOption === i ? `highlightOption highlight` : ""
          } ${this.fadeOutSelection(option) ? "disableSelection" : ""} ${
            this.isDisablePreSelectedValues(option) ? "disableSelection" : ""
          }`}
          onClick={() => this.onSelectItem(option)}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              readOnly
              className={`checkbox`}
              checked={isSelected}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <img className="avatar" src={option["image"]} alt="Avatar" />
              <div className={`optionText`}>
                <div
                  className={`variableName`}
                  dangerouslySetInnerHTML={{
                    __html: this.searchValueColorAndBold(option[variableName]),
                  }}
                />
                <p style={{ fontSize: 18 }}> Position</p>
              </div>
            </div>
          </div>
        </li>
      );
    });
  }
  searchValueColorAndBold(text) {
    const inputValue = this.state.inputValue;
    const regex = new RegExp(inputValue, "gi");
    var newText = text.replace(
      regex,
      "<span style='font-weight: bold'>" + inputValue + "</span>"
    );
    return newText;
  }

  renderSelectedList() {
    const { variableName } = this.props;
    const { selectedItems, closeIconType } = this.state;
    return selectedItems.map((value, index) => (
      <span
        className={`chip  ${
          this.isDisablePreSelectedValues(value) && "disableSelection"
        }`}
        key={index}
      >
        {value[variableName]}
        {!this.isDisablePreSelectedValues(value) && (
          <img
            className="icon_cancel closeIcon"
            src={closeIconType}
            onClick={() => this.onRemoveSelectedItem(value)}
          />
        )}
      </span>
    ));
  }

  isDisablePreSelectedValues(value) {
    const { variableName } = this.props;
    const { preSelectedValues } = this.state;
    if (!preSelectedValues.length) {
      return false;
    }
    return (
      preSelectedValues.filter((i) => i[variableName] === value[variableName])
        .length > 0
    );
  }

  fadeOutSelection(item) {
    const { selectionMaxLimit } = this.props;
    const { selectedItems } = this.state;
    if (selectionMaxLimit == -1) {
      return false;
    }
    if (selectionMaxLimit != selectedItems.length) {
      return false;
    }
    if (selectionMaxLimit == selectedItems.length) {
      if (!true) {
        return true;
      } else {
        if (this.isSelectedValue(item)) {
          return false;
        }
        return true;
      }
    }
  }

  toggelOptionList() {
    this.setState({
      toggleOptionsList: !this.state.toggleOptionsList,
      highlightOption: 0,
    });
  }

  onCloseOptionList() {
    this.setState({
      toggleOptionsList: false,
      highlightOption: 0,
      inputValue: "",
    });
  }

  onFocus() {
    if (this.state.toggleOptionsList) {
      clearTimeout(this.optionTimeout);
    } else {
      this.toggelOptionList();
    }
  }

  onBlur() {
    this.setState({ inputValue: "" }, this.filterOptionsInput);
    this.optionTimeout = setTimeout(this.onCloseOptionList, 250);
  }

  isVisible(elem) {
    return (
      !!elem &&
      !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length)
    );
  }

  hideOnClickOutside() {
    const element = document.getElementsByClassName("multiselect-container")[0];
    const outsideClickListener = (event) => {
      if (
        element &&
        !element.contains(event.target) &&
        this.isVisible(element)
      ) {
        this.toggelOptionList();
      }
    };
    document.addEventListener("click", outsideClickListener);
  }

  renderMultiselectContainer() {
    const { inputValue, toggleOptionsList, selectedItems } = this.state;
    const { placeholder, id } = this.props;
    return (
      <div
        className={`multiselect-container multiSelectContainer`}
        id={id || "multiselectContainerReact"}
      >
        <div
          className={`search-wrapper searchWrapper`}
          ref={this.searchWrapper}
          onClick={false ? this.toggelOptionList : () => {}}
        >
          {this.renderSelectedList()}
          <input
            type="text"
            ref={this.searchBox}
            id={`${id || "search"}_input`}
            onChange={this.onChange}
            onKeyPress={this.onKeyPress}
            value={inputValue}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            placeholder={placeholder}
            onKeyDown={this.onArrowKeyNavigation}
            autoComplete="off"
            disabled={false}
          />
          {<img src={DownArrow} className={`icon_cancel icon_down_dir`} />}
        </div>
        <div
          className={`optionListContainer ${
            toggleOptionsList ? "displayBlock" : "displayNone"
          }`}
          onMouseDown={(e) => {
            e.preventDefault();
          }}
        >
          {this.renderList()}
        </div>
      </div>
    );
  }

  render() {
    return (
      <OutsideAlerter outsideClick={this.onCloseOptionList}>
        {this.renderMultiselectContainer()}
      </OutsideAlerter>
    );
  }
}

Multiselect.defaultProps = {
  items: [],
  selectedItems: [],
  variableName: "Key",
  selectionMaxLimit: -1,
  placeholder: "Select",
  nodatamsg: "No Options Available",
  onSelect: () => {},
  onRemove: () => {},
  onKeyPressFn: () => {},
  id: "",
} as IMultiselectProps;
