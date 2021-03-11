/*
 * Copyright 2017-2021 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { MultiSelect } from "carbon-components-react";
import * as ControlUtils from "./../../util/control-utils";
import ValidationMessage from "./../../components/validation-message";
import classNames from "classnames";
import * as PropertyUtils from "./../../util/property-utils.js";
import { MESSAGE_KEYS, STATES } from "./../../constants/constants.js";
import { formatMessage } from "./../../util/property-utils";

class MultiSelectControl extends React.Component {
	constructor(props) {
		super(props);
		this.getSelectedOption = this.getSelectedOption.bind(this);
		this.genSelectOptions = this.genSelectOptions.bind(this);
		this.handleOnChange = this.handleOnChange.bind(this);
	}

	getSelectedOption(options, selectedValues) {
		const values = PropertyUtils.stringifyFieldValue(selectedValues, this.props.control);
		const selectedOptions = [];
		if (values) {
			values.forEach((value) => selectedOptions.push(options.find(function(option) {
				return option.value === value;
			})));
		}
		return selectedOptions;
	}

	genSelectOptions(selectedValues) {
		const options = [];
		for (let j = 0; j < this.props.controlOpts.values.length; j++) {
			options.push({
				value: this.props.controlOpts.values[j],
				label: this.props.controlOpts.valueLabels[j]
			});
		}
		const selectedOptions = this.getSelectedOption(options, selectedValues);
		return {
			options: options,
			selectedOptions: selectedOptions
		};
	}

	handleOnChange(evt) {
		const controlValues = [];
		for (let i = 0; i < evt.selectedItems.length; i++) {
			controlValues.push(evt.selectedItems[i].value);
		}
		this.props.controller.updatePropertyValue(this.props.propertyId, controlValues);
	}

	render() {
		const multiSelectDropdown = this.genSelectOptions(this.props.value);

		const listBoxMenuIconTranslationIds = {
			"close.menu": formatMessage(this.reactIntl, MESSAGE_KEYS.DROPDOWN_TOOLTIP_CLOSEMENU),
			"open.menu": formatMessage(this.reactIntl, MESSAGE_KEYS.DROPDOWN_TOOLTIP_OPENMENU),
			"clear.all": formatMessage(this.reactIntl, MESSAGE_KEYS.DROPDOWN_TOOLTIP_CLEARALL),
			"clear.selection": formatMessage(this.reactIntl, MESSAGE_KEYS.DROPDOWN_TOOLTIP_CLEARSELECTION)
		};

		const overrideEmptyLabelKey = `${this.props.control.name}.multiselect.dropdown.empty.label`;
		const defaultEmptyLabel = formatMessage(this.reactIntl, MESSAGE_KEYS.MULTISELECT_DROPDOWN_EMPTY_LABEL);
		const overrideOptionsSelectedLabelKey = `${this.props.control.name}.multiselect.dropdown.options.selected.label`;
		const defaultOptionsSelectedLabel = formatMessage(this.reactIntl, MESSAGE_KEYS.MULTISELECT_DROPDOWN_OPTIONS_SELECTED_LABEL);

		let label = "";
		if (multiSelectDropdown.selectedOptions.length === 0) { // Display message for no options selected
			label = this.props.controller.getResource(overrideEmptyLabelKey, defaultEmptyLabel);
		} else { // Display message for multiple options selected
			label = this.props.controller.getResource(overrideOptionsSelectedLabelKey, defaultOptionsSelectedLabel);
		}

		let dropdownComponent = null;
		if (this.props.control.filterable) {
			dropdownComponent = (<MultiSelect.Filterable
				id={`${ControlUtils.getDataId(this.props.propertyId)}-multiselect-filterable`}
				disabled={this.props.state === STATES.DISABLED}
				translateWithId={(id) => listBoxMenuIconTranslationIds[id]}
				items={multiSelectDropdown.options}
				initialSelectedItems={multiSelectDropdown.selectedOptions}
				onChange={this.handleOnChange}
				placeholder={label}
				titleText={this.props.tableControl ? null : this.props.controlItem}
				light
			/>);
		} else {
			dropdownComponent = (<MultiSelect
				id={`${ControlUtils.getDataId(this.props.propertyId)}-multiselect`}
				disabled={this.props.state === STATES.DISABLED}
				translateWithId={(id) => listBoxMenuIconTranslationIds[id]}
				items={multiSelectDropdown.options}
				initialSelectedItems={multiSelectDropdown.selectedOptions}
				onChange={this.handleOnChange}
				label={label}
				titleText={this.props.tableControl ? null : this.props.controlItem}
				light
			/>);
		}

		return (
			<div data-id={ControlUtils.getDataId(this.props.propertyId)}
				className={classNames("properties-dropdown", { "hide": this.props.state === STATES.HIDDEN }, this.props.messageInfo ? this.props.messageInfo.type : null)}
			>
				{dropdownComponent}
				<ValidationMessage state={this.props.state} messageInfo={this.props.messageInfo} inTable={this.props.tableControl} />
			</div>
		);
	}
}

MultiSelectControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	controlItem: PropTypes.element,
	tableControl: PropTypes.bool,
	controlOpts: PropTypes.object, // pass in by redux
	state: PropTypes.string, // pass in by redux
	value: PropTypes.array, // pass in by redux
	messageInfo: PropTypes.object // pass in by redux
};

const mapStateToProps = (state, ownProps) => {
	const props = {
		value: ownProps.controller.getPropertyValue(ownProps.propertyId),
		state: ownProps.controller.getControlState(ownProps.propertyId),
		messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId),
		controlOpts: ownProps.controller.getFilteredEnumItems(ownProps.propertyId, ownProps.control)
	};
	return props;
};

export default connect(mapStateToProps, null)(MultiSelectControl);
