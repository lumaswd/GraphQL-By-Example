import React, { Component } from 'react';
import { JobList } from './JobList';
// const { jobs } = require('./fake-data');
import { loadJobs } from './requests';

export class JobBoard extends Component {

  constructor(props) {
    super(props); // Convention in React
    this.state = { jobs: [] };
  }

  // React Lifecycle Method
  async componentDidMount() {
    const jobs = await loadJobs();
    this.setState({ jobs }); // React spcific; (with setState React handles rerendering and Co)
  }

  // Function to display the template
  render() {
    const { jobs } = this.state;

    return (
      <div>
        <h1 className="title">Job Board</h1>
        <JobList jobs={jobs} />
      </div>
    );
  }
}

// Alternative
// <JobList jobs={jobs} /> ==> Tutorial approach
// <JobList jobs={this.state.jobs} />
