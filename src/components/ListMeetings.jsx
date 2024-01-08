import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';

export default function ListMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [users, setUsers] = useState([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const fetchMeetings = async () => {
      const meetingsCollection = collection(db, '2024', 'general', 'rccs_meetings');
      const meetingsSnapshot = await getDocs(meetingsCollection);
      const meetingsData = await Promise.all(
        meetingsSnapshot.docs.map(async (doc) => {
          const meetingData = doc.data();
          return { id: doc.id, ...meetingData };
        })
      );
      setMeetings(meetingsData);
    };

    const fetchUsers = async () => {
      const usersCollection = collection(db, '2024', 'general', 'rccs_users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersData = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      setFilteredUsers(usersData); // Initialize filteredUsers with all users
    };

    fetchMeetings();
    fetchUsers();
  }, []);

  useEffect(() => {
    // Update filtered users based on the search term
    const filteredUsers = users.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filteredUsers);
  }, [searchTerm, users]);

  const handleUpdateMeeting = async (meetingId) => {
    const meetingRef = doc(db, '2024', 'general', 'rccs_meetings', meetingId);
    await updateDoc(meetingRef, { /* updated data */ });
    // You can add logic to refresh the list or handle the update in the UI
  };

  const handleDeleteMeeting = async (meetingId) => {
    const meetingRef = doc(db, '2024', 'general', 'rccs_meetings', meetingId);
    await deleteDoc(meetingRef);
    // You can add logic to refresh the list or handle the deletion in the UI
  };

  const handleAddMember = async (meetingId) => {
    const meetingRef = doc(db, '2024', 'general', 'rccs_meetings', meetingId);

    try {
      const meetingDoc = await getDoc(meetingRef);

      if (meetingDoc.exists()) {
        const meetingData = meetingDoc.data();

        // Filter users based on the search term and not in the attendance array
        const usersNotInAttendance = filteredUsers.filter(
          (user) => !meetingData.attendance.includes(`2024/general/rccs_users/${user.id}`)
        );

        setShowAddMemberModal(true);
        setAvailableUsers(usersNotInAttendance);
      } else {
        console.error('Meeting document does not exist');
      }
    } catch (error) {
      console.error('Error fetching meeting document:', error);
    }
  };

  const handleAddMemberSubmit = async (meetingId) => {
    const meetingRef = doc(db, '2024', 'general', 'rccs_meetings', meetingId);

    try {
      const meetingDoc = await getDoc(meetingRef);

      if (meetingDoc.exists()) {
        const meetingData = meetingDoc.data();

        // Save reference URLs of selected users to the attendance array
        const selectedUserUrls = selectedUsers.map((user) => `2024/general/rccs_users/${user.id}`);

        // Update the Firestore document with the new attendance array
        await updateDoc(meetingRef, { attendance: [...meetingData.attendance, ...selectedUserUrls] });

        setShowAddMemberModal(false);
        // Clear the search term to show all users again
        setSearchTerm('');
      } else {
        console.error('Meeting document does not exist');
      }
    } catch (error) {
      console.error('Error fetching meeting document:', error);
    }
  };

  return (
    <div>
      <h2>List of Meetings</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Attendance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {meetings.map((meeting) => (
            <tr key={meeting.id}>
              <td>{meeting.date}</td>
              <td>{meeting.description}</td>
              <td>
                <ul>
                  {meeting.attendance.map((userRefUrl, index) => {
                    let userId;
                    try {
                      userId = userRefUrl.split('/').pop();
                    } catch (error) {
                      console.error('Error extracting user ID from URL:', error);
                      console.log('Invalid userRefUrl:', userRefUrl);
                      return null;
                    }

                    const user = users.find((u) => u.id === userId);
                    if (!user) {
                      console.warn(`User not found for ID: ${userId}`);
                      console.log('Users array:', users);
                    }

                    return (
                      <li key={index}>
                        {user ? user.name : "User not found"}
                      </li>
                    );
                  })}
                </ul>
              </td>
              <td>
                <button onClick={() => handleUpdateMeeting(meeting.id)}>Update</button>
                <button onClick={() => handleDeleteMeeting(meeting.id)}>Delete</button>
                <button onClick={() => handleAddMember(meeting.id)}>Add Member</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAddMemberModal && (
        <div>
          <h3>Add Member</h3>
          <label>
            Search Member:
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
          <ul>
            {availableUsers.map((user) => (
              <li key={user.id}>
                <input
                  type="checkbox"
                  checked={selectedUsers.some((u) => u.id === user.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers((prevUsers) => [...prevUsers, user]);
                    } else {
                      setSelectedUsers((prevUsers) =>
                        prevUsers.filter((u) => u.id !== user.id)
                      );
                    }
                  }}
                />
                {user.name}
              </li>
            ))}
          </ul>
          <button onClick={() => handleAddMemberSubmit(meetings[0]?.id)}>Add Member</button>
          <button onClick={() => setShowAddMemberModal(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
