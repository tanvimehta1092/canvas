/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2017
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/
/* eslint complexity: ["error", 14] */
/* eslint max-depth: ["error", 5] */

import logger from "../../../utils/logger";
import React from "react";
import EditorControl from "./editor-control.jsx";
import { Table } from "reactable";
import {
	Button,
	Checkbox,
	TextField
} from "ap-components-react/dist/ap-components-react";

import Isvg from "react-inlinesvg";
import search32 from "../../../assets/images/search_32.svg";
import reset32 from "../../../assets/images/reset_32.svg";

import { DATA_TYPES } from "../constants/constants.js";

import dateEnabledIcon from "../../../assets/images/date-enabled-icon.svg";
import integerEnabledIcon from "../../../assets/images/integer-enabled-icon.svg";
import doubleEnabledIcon from "../../../assets/images/double-enabled-icon.svg";
import stringEnabledIcon from "../../../assets/images/string-enabled-icon.svg";
import timeEnabledIcon from "../../../assets/images/time-enabled-icon.svg";
import timestampEnabledIcon from "../../../assets/images/timestamp-enabled-icon.svg";

import dateDisabledIcon from "../../../assets/images/date-disabled-icon.svg";
import integerDisabledIcon from "../../../assets/images/integer-disabled-icon.svg";
import doubleDisabledIcon from "../../../assets/images/double-disabled-icon.svg";
import stringDisabledIcon from "../../../assets/images/string-disabled-icon.svg";
import timeDisabledIcon from "../../../assets/images/time-disabled-icon.svg";
import timestampDisabledIcon from "../../../assets/images/timestamp-disabled-icon.svg";

export default class FieldPicker extends EditorControl {
	constructor(props) {
		super(props);
		this.state = {
			checkedAll: false,
			controlName: "",
			data: this.props.dataModel,
			filterIcons: [],
			filterKeyword: "",
			filterList: [],
			initialControlValues: [],
			newControlValues: []
		};

		this.dateEnabledIcon = dateEnabledIcon;
		this.integerEnabledIcon = integerEnabledIcon;
		this.doubleEnabledIcon = doubleEnabledIcon;
		this.stringEnabledIcon = stringEnabledIcon;
		this.timeEnabledIcon = timeEnabledIcon;
		this.timestampEnabledIcon = timestampEnabledIcon;

		this.dateDisabledIcon = dateDisabledIcon;
		this.integerDisabledIcon = integerDisabledIcon;
		this.doubleDisabledIcon = doubleDisabledIcon;
		this.stringDisabledIcon = stringDisabledIcon;
		this.timeDisabledIcon = timeDisabledIcon;
		this.timestampDisabledIcon = timestampDisabledIcon;

		this.filterType = this.filterType.bind(this);
		this.getTableData = this.getTableData.bind(this);
		this.handleBack = this.handleBack.bind(this);
		this.handleCheckAll = this.handleCheckAll.bind(this);
		this.handleFieldChecked = this.handleFieldChecked.bind(this);
		this.handleFilterChange = this.handleFilterChange.bind(this);
		this.handleReset = this.handleReset.bind(this);
	}

	componentWillMount() {
		const fields = this.state.data.fields;
		const filterList = DATA_TYPES;
		const filters = [];

		for (let i = 0; i < filterList.length; i++) {
			for (let j = 0; j < fields.length; j++) {
				var field = fields[j];

				if (filterList[i] === field.type) {
					filters.push({
						"type": field.type,
						"icon": {
							"enabled": <img src={this[field.type + "EnabledIcon"]} />,
							"disabled": <img src={this[field.type + "DisabledIcon"]} />
						}
					});
					break;
				}
			}
		}

		const controlName = this.props.control.name;
		this.setState({
			controlName: controlName,
			initialControlValues: this.props.currentControlValues[controlName],
			newControlValues: this.props.currentControlValues[controlName],
			filterList: filters
		});
	}

	// reactable
	getTableData() {
		const fields = this.state.data.fields;
		const tableData = [];
		logger.info(JSON.stringify("control vals: " + this.state.newControlValues));
		for (let i = 0; i < fields.length; i++) {
			var field = fields[i];
			var checked = false;

			if (this.state.checkedAll) {
				checked = true;
			} else {
				for (let j = 0; j < this.state.newControlValues.length; j++) {
					let key = [];
					if (this.props.control.defaultRow) {
						key = this.state.newControlValues[j].split(",")[0];
					} else {
						key = this.state.newControlValues[j];
					}
					if (key.indexOf(field.name) >= 0) {
						checked = true;
						break;
					}
				}
			}

			if (this.state.filterIcons.length === 0 || this.state.filterIcons.indexOf(field.type) < 0) {
				tableData.push({
					"checkbox": <div className="field-picker-checkbox">
					<Checkbox id={"field-picker-checkbox-" + i}
						checked={checked}
						onChange={this.handleFieldChecked}
						data-name={field.name}
					/></div>,
					"fieldName": field.name,
					"dataType": <div>
						<div className={"field-picker-data-type-icon field-picker-data-" + field.type + "-type-icon"}>
							<img src={this[field.type + "EnabledIcon"]} />
						</div>
						{field.type}
					</div>
				});
			}
		}
		return tableData;
	}

	handleBack() {
		this.props.updateControlValue(this.state.controlName, this.state.newControlValues);
		this.props.closeFieldPicker();
	}

	handleCheckAll(evt) {
		const selectAll = [];
		if (evt.target.checked) {
			const data = this.state.data.fields;
			for (let i = 0; i < data.length; i++) {
				const selected = this.state.newControlValues.filter(function(element) {
					return element.indexOf(data[i].name) > -1;
				});
				if (selected.length > 0) {
					// add the already selected fields
					if (this.props.control.defaultRow) {
						selectAll.push(JSON.parse(selected));
					} else {
						selectAll.push(selected[0]);
					}
				} else if (this.props.control.defaultRow) { // add remaining fields
					selectAll.push([data[i].name, this.props.control.defaultRow[0]]);
				} else {
					selectAll.push(data[i].name);
				}
			}
		}

		if (this.props.control.defaultRow) {
			this.setState({
				newControlValues: EditorControl.stringifyStructureStrings(selectAll),
				checkedAll: evt.target.checked
			});
		} else {
			this.setState({
				newControlValues: selectAll,
				checkedAll: evt.target.checked
			});
		}
	}

	handleFieldChecked(evt) {
		const current = this.state.newControlValues;
		const initialControlValues = this.state.initialControlValues;
		const selectedFieldName = evt.currentTarget.dataset.name;
		let selectedField = [];
		// if selectedField is in the original list, grab that row instead of generating new selectedField
		for (let i = 0; i < initialControlValues.length; i++) {
			if (initialControlValues[i].split(",")[0].indexOf(selectedFieldName) > -1) {
				selectedField = initialControlValues[i];
				break;
			}
		}
		if (selectedField.length === 0) {
			if (this.props.control.defaultRow) {
				selectedField = EditorControl.stringifyStructureStrings([[selectedFieldName, this.props.control.defaultRow[0]]])[0];
			} else {
				selectedField = selectedFieldName;
			}
		}

		if (evt.target.checked) {
			this.setState({ newControlValues: current.concat(selectedField) });
		} else {
			const modified = current.filter(function(element) {
				return element !== selectedField;
			});

			this.setState({
				newControlValues: modified,
				checkedAll: false
			});
		}
	}

	handleFilterChange(evt) {
		this.setState({ filterKeyword: evt.target.value });
	}

	handleReset() {
		if (this.state.initialControlValues.length !== this.state.data.fields.length) {
			this.setState({ checkedAll: false });
		}
		this.setState({
			newControlValues: this.state.initialControlValues
		});
	}

	filterType(evt) {
		const type = evt.currentTarget.dataset.type;
		const iconsSelected = this.state.filterIcons;
		const index = iconsSelected.indexOf(type);
		if (index < 0) {
			iconsSelected.push(type);
		} else {
			iconsSelected.splice(index, 1);
		}
		this.setState({ filterIcons: iconsSelected });
	}

	render() {
		const header = (
			<div>
				<Button
					id="field-picker-back-button"
					back icon="back"
					onClick={this.handleBack}
				/>
				<label className="control-label">Select Fields for Node</label>
				<div id="reset-fields-button"
					className="button"
					onClick={this.handleReset}
				>
					<div id="reset-fields-button-label">Reset</div>
					<div id="reset-fields-button-icon">
						<Isvg src={reset32} />
					</div>
				</div>
			</div>
		);

		const that = this;
		const filters = this.state.filterList.map(function(filter, ind) {
			let enabled = true;
			for (let i = 0; i < that.state.filterIcons.length; i++) {
				if (filter.type === that.state.filterIcons[i]) {
					enabled = false;
					break;
				}
			}
			let row = (
				<li className={"filter-list-li filter-list-li-icon filter-list-data-" + filter.type + "-enabled-icon"}
					key={"filters" + ind}
					data-type={filter.type}
					onClick={that.filterType.bind(that)}
				>
					{filter.icon.enabled}
				</li>
			);
			if (!enabled) {
				row = (
					<li className={"filter-list-li filter-list-li-icon filter-list-data-" + filter.type + "-disabled-icon"}
						key={"filters" + ind}
						data-type={filter.type}
						onClick={that.filterType.bind(that)}
					>
						{filter.icon.disabled}
					</li>
				);
			}

			return (
				row
			);
		});

		const search = (
			<div>
				<div id="field-picker-search-bar">
					<TextField
						type="search"
						id="field-picker-search"
						className="field-picker-toolbar"
						placeholder="Search for a field"
						disabledPlaceholderAnimation
						onChange={this.handleFilterChange}
						value={this.state.filterKeyword}
					/>
				</div>
				<div id="field-picker-search-icon"
					className="field-picker-toolbar"
				>
					<Isvg id="field-picker-search-icon"
						src={search32}
					/>
				</div>
				<div >
					<ul id="field-picker-filter-list">
						<li id="filter-list-title" className="filter-list-li">
							Filter:
						</li>
						{filters}
					</ul>
				</div>
			</div>
		);

		let checkedAll = this.state.checkedAll;
		// check all box should be checked if all is selected
		if (this.state.data.fields.length === this.state.newControlValues.length) {
			checkedAll = true;
		} else {
			checkedAll = false;
		}

		const headers = [
			{ "key": "checkbox", "label": <div className="field-picker-checkbox">
					<Checkbox id={"field-picker-checkbox-all"}
						onChange={this.handleCheckAll}
						checked={checkedAll}
					/>
				</div> },
			{ "key": "fieldName", "label": "Field name" },
			{ "key": "dataType", "label": "Data type" }
		];

		const tableData = this.getTableData();

		const table = (<div id="field-picker-table-container">
			<Table className="table" id="table"
				sortable
				filterable={["fieldName"]}
				hideFilterInput
				filterBy={this.state.filterKeyword}
				columns={headers}
				data={tableData}
			/>
		</div>);

		return (
			<div>
				{header}
				{search}
				{table}
			</div>
		);
	}
}

FieldPicker.propTypes = {
	closeFieldPicker: React.PropTypes.func.isRequired,
	currentControlValues: React.PropTypes.object.isRequired,
	dataModel: React.PropTypes.object.isRequired,
	updateControlValue: React.PropTypes.func,
	control: React.PropTypes.object
};
