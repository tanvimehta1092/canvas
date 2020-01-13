/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2018, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import FlexibleTable from "./../../components/flexible-table";
import MoveableTableRows from "./../../components/moveable-table-rows";
import AbstractTable from "./../abstract-table.jsx";
import ValidationMessage from "./../../components/validation-message";
import ControlUtils from "./../../util/control-utils";
import PropertyUtils from "./../../util/property-utils";

import { TABLE_SCROLLBAR_WIDTH, STATES, MESSAGE_KEYS, MESSAGE_KEYS_DEFAULTS } from "./../../constants/constants";

import ReadonlyControl from "./../readonly";

/* eslint max-depth: ["error", 6] */

class SelectColumns extends AbstractTable {

	constructor(props) {
		super(props);
		this.reactIntl = props.controller.getReactIntl();
	}

	makeRows(controlValue, tableState) {
		const rows = [];
		if (controlValue) {
			for (var rowIndex = 0; rowIndex < controlValue.length; rowIndex++) {
				const columns = [];
				// If the propertyId contains 'row' then this selectcolumns control is part of a table.
				// Need to add an additional 'index' to retrieve the correct value from the control within a table.
				const row = typeof this.props.propertyId.row !== "undefined"
					? { row: this.props.propertyId.row, index: rowIndex }
					: { row: rowIndex };
				const propertyId = Object.assign({}, this.props.propertyId, row);
				const control = Object.assign({}, this.props.control);
				if (control.dmImage) {
					const fields = this.props.controller.getDatasetMetadataFields();
					const value = PropertyUtils.stringifyFieldValue(this.props.controller.getPropertyValue(propertyId), control, true);
					const icon = PropertyUtils.getDMFieldIcon(fields,
						value, control.dmImage);
					control.icon = icon;
				}
				const cellContent = (
					<div className="properties-table-cell-control">
						<ReadonlyControl
							control={control}
							propertyId={propertyId}
							controller={this.props.controller}
							tableControl
						/>
					</div>
				);
				columns.push({
					key: rowIndex + "-0-field",
					column: "field",
					content: cellContent
				});
				// add padding for scrollbar
				columns.push({
					column: "scrollbar",
					width: TABLE_SCROLLBAR_WIDTH,
					content: <div />
				});
				rows.push({
					key: rowIndex,
					onClickCallback: this.handleRowClick.bind(this, rowIndex, false),
					columns: columns,
					className: "column-select-table-row"
				});
			}
		}
		return rows;
	}

	/**
	* Callback function invoked when closing field picker
	* @param allSelectedFields all fields selected, includes newSelections
	* @param newSelections the newly selected rows
	*/
	onFieldPickerClose(allSelectedFields, newSelections) {
		if (allSelectedFields && newSelections) {
			this.setCurrentControlValueSelected(allSelectedFields, newSelections);
			const scrollToRow = newSelections[newSelections.length - 1];
			this.setScrollToRow(scrollToRow);
		}
	}

	makeHeader() {
		const headers = [];
		headers.push({
			"key": "field",
			"label": PropertyUtils.formatMessage(this.reactIntl,
				MESSAGE_KEYS.FIELDPICKER_FIELDCOLUMN_LABEL, MESSAGE_KEYS_DEFAULTS.FIELDPICKER_FIELDCOLUMN_LABEL),
			"description": (null) });
		headers.push({ "key": "scrollbar", "label": "", "width": TABLE_SCROLLBAR_WIDTH });
		return headers;
	}

	render() {
		const headers = this.makeHeader();

		const tableButtonConfig = {
			fieldPickerCloseFunction: this.onFieldPickerClose
		};

		const rows = this.makeRows(this.props.value, this.props.state);
		const topRightPanel = this.makeAddRemoveButtonPanel(this.props.state, tableButtonConfig);
		let rowToScrollTo;
		if (Number.isInteger(this.scrollToRow) && rows.length > this.scrollToRow) {
			rowToScrollTo = this.scrollToRow;
			delete this.scrollToRow;
		}
		const table =	(
			<FlexibleTable
				columns={headers}
				data={rows}
				scrollToRow={rowToScrollTo}
				topRightPanel={topRightPanel}
				scrollKey={this.props.control.name}
				tableState={this.props.state}
				messageInfo={this.props.messageInfo}
				rows={this.props.control.rows}
				controller={this.props.controller}
				selectedRows={this.props.selectedRows}
				rowSelection={this.props.control.rowSelection}
				updateRowSelections={this.updateRowSelections}
			/>);

		var content = (
			<div>
				<div className="properties-column-select-table">
					{table}
				</div>
				<ValidationMessage state={this.props.state} messageInfo={this.props.messageInfo} />
			</div>
		);

		return (
			<div data-id={ControlUtils.getDataId(this.props.propertyId)} className="properties-column-select" >
				<MoveableTableRows
					tableContainer={content}
					control={this.props.control}
					controller={this.props.controller}
					propertyId={this.props.propertyId}
					setScrollToRow={this.setScrollToRow}
					setCurrentControlValueSelected={this.setCurrentControlValueSelected}
					disabled={this.props.state === STATES.DISABLED}

				/>
			</div>
		);
	}
}

SelectColumns.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	openFieldPicker: PropTypes.func.isRequired,
	selectedRows: PropTypes.array, // set by redux
	state: PropTypes.string, // pass in by redux
	value: PropTypes.array, // pass in by redux
	messageInfo: PropTypes.object // pass in by redux
};


const mapStateToProps = (state, ownProps) => ({
	value: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId),
	selectedRows: ownProps.controller.getSelectedRows(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(SelectColumns);
