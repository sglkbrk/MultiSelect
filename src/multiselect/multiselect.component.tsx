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
      options: props.options,
      filteredOptions: props.options,
      unfilteredOptions: props.options,
      selectedValues: Object.assign([], props.selectedValues),
      preSelectedValues: Object.assign([], props.selectedValues),
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
    this.searchValueColor = this.searchValueColor.bind(this);
    this.onRemoveSelectedItem = this.onRemoveSelectedItem.bind(this);
    this.toggelOptionList = this.toggelOptionList.bind(this);
    this.onArrowKeyNavigation = this.onArrowKeyNavigation.bind(this);
    this.onSelectItem = this.onSelectItem.bind(this);
    this.filterOptionsInput = this.filterOptionsInput.bind(this);
    this.removeSelectedValuesFromOptions =
      this.removeSelectedValuesFromOptions.bind(this);
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
    this.removeSelectedValuesFromOptions(false);
  }

  resetSelectedValues() {
    const { unfilteredOptions } = this.state;
    return new Promise((resolve) => {
      this.setState(
        {
          selectedValues: [],
          preSelectedValues: [],
          options: unfilteredOptions,
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
    return this.state.selectedValues;
  }

  getSelectedItemsCount() {
    return this.state.selectedValues.length;
  }

  componentDidMount() {
    this.initialSetValue();
    this.searchWrapper.current.addEventListener("click", this.listenerCallback);
  }

  componentDidUpdate(prevProps) {
    const { options, selectedValues } = this.props;
    const { options: prevOptions, selectedValues: prevSelectedvalues } =
      prevProps;
    if (JSON.stringify(prevOptions) !== JSON.stringify(options)) {
      this.setState(
        { options, filteredOptions: options, unfilteredOptions: options },
        this.initialSetValue
      );
    }
    if (JSON.stringify(prevSelectedvalues) !== JSON.stringify(selectedValues)) {
      this.setState(
        {
          selectedValues: Object.assign([], selectedValues),
          preSelectedValues: Object.assign([], selectedValues),
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

  removeSelectedValuesFromOptions(skipCheck) {
    const { displayValue } = this.props;
    const { selectedValues = [], unfilteredOptions, options } = this.state;
    if (!selectedValues.length && !skipCheck) {
      return;
    }
    if (true) {
      let optionList = unfilteredOptions.filter((item) => {
        return selectedValues.findIndex(
          (v) => v[displayValue] === item[displayValue]
        ) === -1
          ? true
          : false;
      });
      this.setState(
        { options: optionList, filteredOptions: optionList },
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
    let { options, filteredOptions, inputValue } = this.state;
    const { displayValue } = this.props;
    options = filteredOptions.filter((i) =>
      this.matchValues(i[displayValue], inputValue)
    );
    this.setState({ options });
  }

  matchValues(value, search) {
    if (value.toLowerCase)
      return value.toLowerCase().indexOf(search.toLowerCase()) > -1;
  }

  // Ok Tuşuyla Gezinme
  onArrowKeyNavigation(e) {
    const {
      options,
      highlightOption,
      toggleOptionsList,
      inputValue,
      selectedValues,
    } = this.state;
    const { disablePreSelectedValues } = this.props;
    if (
      e.keyCode === 8 &&
      !inputValue &&
      !disablePreSelectedValues &&
      selectedValues.length
    ) {
      this.onRemoveSelectedItem(selectedValues.length - 1);
    }
    if (!options.length) {
      return;
    }
    if (e.keyCode === 38) {
      if (highlightOption > 0) {
        this.setState((previousState) => ({
          highlightOption: previousState.highlightOption - 1,
        }));
      } else {
        this.setState({ highlightOption: options.length - 1 });
      }
    } else if (e.keyCode === 40) {
      if (highlightOption < options.length - 1) {
        this.setState((previousState) => ({
          highlightOption: previousState.highlightOption + 1,
        }));
      } else {
        this.setState({ highlightOption: 0 });
      }
    } else if (e.key === "Enter" && options.length && toggleOptionsList) {
      if (highlightOption === -1) {
        return;
      }
      this.onSelectItem(options[highlightOption]);
    }
    setTimeout(() => {
      const element = document.querySelector("ul.optionContainer .highlight");
      if (element) {
        element.scrollIntoView();
      }
    });
  }

  onRemoveSelectedItem(item) {
    let { selectedValues, index = 0 } = this.state;
    const { onRemove, displayValue } = this.props;
    index = selectedValues.findIndex(
      (i) => i[displayValue] === item[displayValue]
    );
    selectedValues.splice(index, 1);
    onRemove(selectedValues, item);
    this.setState({ selectedValues }, () => {});
  }

  onSelectItem(item) {
    const { selectedValues } = this.state;
    const { selectionLimit, onSelect } = this.props;
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
    if (selectionLimit == selectedValues.length) {
      return;
    }
    selectedValues.push(item);
    onSelect(selectedValues, item);
    this.setState({ selectedValues }, () => {
      this.filterOptionsInput();
    });
  }

  isSelectedValue(item) {
    const { displayValue } = this.props;
    const { selectedValues } = this.state;
    return (
      selectedValues.filter((i) => i[displayValue] === item[displayValue])
        .length > 0
    );
  }

  renderList() {
    const { nodata, loading, loadingMessage = "loading..." } = this.props;
    const { options } = this.state;
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
        {options.length === 0 && <span className={`notFound`}>{nodata}</span>}
        {this.renderOption()}
      </ul>
    );
  }

  renderOption() {
    const { displayValue } = this.props;
    const { highlightOption } = this.state;
    return this.state.options.map((option, i) => {
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
                  className={`displayValue`}
                  dangerouslySetInnerHTML={{
                    __html: this.searchValueColor(option[displayValue]),
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
  searchValueColor(text) {
    const inputValue = this.state.inputValue;
    const regex = new RegExp(inputValue, "gi");
    var newText = text.replace(
      regex,
      "<span style='font-weight: bold'>" + inputValue + "</span>"
    );
    return newText;
  }

  renderSelectedList() {
    const { displayValue } = this.props;
    const { selectedValues, closeIconType } = this.state;
    return selectedValues.map((value, index) => (
      <span
        className={`chip  ${
          this.isDisablePreSelectedValues(value) && "disableSelection"
        }`}
        key={index}
      >
        {value[displayValue]}
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
    const { disablePreSelectedValues, displayValue } = this.props;
    const { preSelectedValues } = this.state;
    if (!disablePreSelectedValues || !preSelectedValues.length) {
      return false;
    }
    return (
      preSelectedValues.filter((i) => i[displayValue] === value[displayValue])
        .length > 0
    );
  }

  fadeOutSelection(item) {
    const { selectionLimit } = this.props;
    const { selectedValues } = this.state;
    if (selectionLimit == -1) {
      return false;
    }
    if (selectionLimit != selectedValues.length) {
      return false;
    }
    if (selectionLimit == selectedValues.length) {
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
    const { inputValue, toggleOptionsList, selectedValues } = this.state;
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
  options: [],
  disablePreSelectedValues: false,
  selectedValues: [],
  displayValue: "Key",
  selectionLimit: -1,
  placeholder: "Select",
  nodatamsg: "No Options Available",
  onSelect: () => {},
  onRemove: () => {},
  onKeyPressFn: () => {},
  id: "",
} as IMultiselectProps;
