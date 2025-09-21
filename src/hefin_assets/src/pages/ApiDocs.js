import React from 'react';

const ApiDocs = () => {
  return (
    <div className="api-docs">
      <h1>HEFIN API Documentation</h1>
      
      <section>
        <h2>User Management</h2>
        <table>
          <thead>
            <tr>
              <th>Endpoint</th>
              <th>Description</th>
              <th>Parameters</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>createUser(name)</td>
              <td>Create a new user profile</td>
              <td>name: Text</td>
            </tr>
            <tr>
              <td>getUserProfile()</td>
              <td>Get current user's profile</td>
              <td>None</td>
            </tr>
          </tbody>
        </table>
      </section>
      
      <section>
        <h2>Health Records</h2>
        <table>
          <thead>
            <tr>
              <th>Endpoint</th>
              <th>Description</th>
              <th>Parameters</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>addHealthRecord(recordType, data)</td>
              <td>Add a new health record</td>
              <td>recordType: Text, data: Text</td>
            </tr>
            <tr>
              <td>getHealthRecord(recordId)</td>
              <td>Get a specific health record</td>
              <td>recordId: Text</td>
            </tr>
          </tbody>
        </table>
      </section>
      
      {/* Add more sections for other API categories */}
    </div>
  );
};

export default ApiDocs;
