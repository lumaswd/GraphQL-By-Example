import React, { Component } from 'react';
import { Link } from 'react-router-dom';
// import { jobs } from './fake-data';
import { loadJob } from './requests';

export class JobDetail extends Component {

  constructor(props) {
    super(props); // Convention from Reacht
    // this.state = { job: jobs.find((job) => job.id === jobId) };
    this.state = { job: null };
  }

  async componentDidMount() { // Reacht Lifecycle Method
    const { jobId } = this.props.match.params;
    const job = await loadJob(jobId);
    this.setState({ job }); // Triggers re-rendering and should display the new data // React specific; (with setState React handles rerendering and Co)
  }

  render() {
    const { job } = this.state;
    if (!job) {
      return null; // Not to display anything // to prevent errors like job.title (job ==> null)
    }

    return (
      <div>
        <h1 className="title">{job.title}</h1>
        <h2 className="subtitle">
          <Link to={`/companies/${job.company.id}`}>{job.company.name}</Link>
        </h2>
        <div className="box">{job.description}</div>
      </div>
    );
  }
}
