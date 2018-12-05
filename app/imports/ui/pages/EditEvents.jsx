import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Loader, Container, Segment, Form, Header } from 'semantic-ui-react';
import { Bert } from 'meteor/themeteorchef:bert';
import { Data } from '/imports/api/data/data';
import PropTypes from 'prop-types';

/** Semantic React-styled date and time picker. https://www.npmjs.com/package/semantic-ui-calendar-react */
import { DateInput, TimeInput } from 'semantic-ui-calendar-react';

/** Some sample options. Admin can also type in custom options and will be saved in dropdowns. */
const campusOptions = [
  { key: 'uh manoa', text: 'University of Hawaii at Manoa', value: "University of Hawaii at Manoa" },
  { key: 'kcc', text: 'Kapiolani Community College', value: "Kapiolani Community College" },
  { key: 'west oahu', text: 'University of Hawaiʻi - West Oahu', value: "University of Hawaii - West Oahu" },
];
const buildingOptions = [
  { key: 'qlc', text: 'Queen Liliʻuokalani Center', value: "Queen Liliʻuokalani Center" },
  { key: 'campus center', text: 'Campus Center', value: "Campus Center" },
  { key: 'post', text: 'Pacific Ocean Science and Technology', value: "Pacific Ocean Science and Technology" },
];

/** Renders the Page for editing a single document.
 * TODO: Implement addAdditions to dropdown options. */
class EditEvents extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      campus: this.props.data.campus,
      building: this.props.data.building,
      date: this.props.data.date,
      timeStart: this.props.data.timeStart,
      timeEnd: this.props.data.timeEnd,
      notes: this.props.data.notes,
      _id: this.props.data._id
    };
    this.options = { campusOptions, buildingOptions };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.insertCallback = this.insertCallback.bind(this);
  }

  /** Notify the user of the results of the submit. If successful, redirect to Events.
   * TODO: Redirect the page. */
  insertCallback(error) {
    if (error) {
      Bert.alert({ type: 'danger', message: `Could not update event: ${error.message}` });
    } else {
      Bert.alert({ type: 'success', message: `Updated ${this.state.date}: ${this.state.building} Event` });
    }
  }

  /** Handles changes to input fields. */
  handleChange(event, { name, value }) {
    this.setState({ [name]: value });
  }

  /** Inserts submitted values into Data collection as Event data. */
  handleSubmit() {
    const { campus, building, date, timeStart, timeEnd, notes, _id } = this.state;
    const input = [];
    Data.update(_id, { $set: { campus, building, date, timeStart, timeEnd, notes, input } },
        this.insertCallback);
  }

  /** If the subscription(s) have been received, render the page, otherwise show a loading icon. */
  render() {
    return (this.props.ready) ? this.renderPage() : <Loader active>Getting data</Loader>;
  }

  /** Render the form. Use Uniforms: https://github.com/vazco/uniforms */
  renderPage() {
    const { campus, building, date, timeStart, timeEnd, notes } = this.state;
    return (
        <Container style={{ paddingBottom: '15px' }}>
          <Header as="h2" textAlign="center">Editing {this.props.data.date}: {this.props.data.building}</Header>
          <Segment>
            <Form onSubmit={this.handleSubmit}>
              <Form.Group widths='equal'>
                <Form.Select required fluid search label='Campus'
                             options={this.options.campusOptions}
                             name="campus"
                             placeholder='Select the campus the audit is being held at.'
                             value={campus}
                             onChange={this.handleChange}
                             allowAdditions
                             onAddItem={this.handleAddition}
                />
                <Form.Select required fluid search selection label='Building'
                             options={this.options.buildingOptions}
                             name="building"
                             placeholder='Select a building, or type a new building name to save it.'
                             value={building}
                             onChange={this.handleChange}
                             allowAdditions
                             onAddItem={this.handleAddition}
                />
              </Form.Group>
              <Form.Group widths="equal">
                <Form.Field required label="Date of Event"
                            control={DateInput}
                            name="date"
                            placeholder="Select a date using the calendar."
                            dateFormat="MM/DD/YYYY"
                            iconPosition="left"
                            value={date}
                            onChange={this.handleChange}
                />
                <Form.Field required label="Start Time"
                            control={TimeInput}
                            name="timeStart"
                            placeholder="Select a start time."
                            timeFormat="AMPM"
                            iconPosition="left"
                            value={timeStart}
                            onChange={this.handleChange}
                />
                <Form.Field required label="End Time"
                            control={TimeInput}
                            name="timeEnd"
                            placeholder="Select a finish time."
                            timeFormat="AMPM"
                            iconPosition="left"
                            value={timeEnd}
                            onChange={this.handleChange}
                />
              </Form.Group>
              <Form.TextArea label="Notes"
                             name="notes"
                             placeholder="Write any notes about this event."
                             value={notes}
                             onChange={this.handleChange}
              />
              <Form.Button content="Submit"/>
            </Form>
          </Segment>
        </Container>
    );
  }
}

/** Require the presence of a Events in the props object. */
EditEvents.propTypes = {
  data: PropTypes.object.isRequired,
  ready: PropTypes.bool.isRequired,
};

/** withTracker connects Meteor data to React components. https://guide.meteor.com/react.html#using-withTracker */
export default withTracker(({ match }) => {
  // Get the documentID from the URL field. See imports/ui/layouts/App.jsx for the route containing :_id.
  const docID = match.params._id;
  // Get access to Events.
  const subscription = Meteor.subscribe('Data');
  return {
    data: Data.findOne(docID),
    ready: subscription.ready(),
  };
})(EditEvents);
