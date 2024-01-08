import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function ListUsers() {
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedAge, setEditedAge] = useState('');
  const [editedApproval, setEditedApproval] = useState(false);
  const [sortingOption, setSortingOption] = useState('all'); // 'all', 'approved', 'notApproved'

  useEffect(() => {
    getUsers();
  }, [sortingOption]);

  function getUsers() {
    const userCollectionRef = collection(db, '2024', 'general', 'rccs_users');
    getDocs(userCollectionRef)
      .then((response) => {
        const userData = response.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }));

        // Filter based on sorting option
        const filteredUsers =
          sortingOption === 'approved'
            ? userData.filter((user) => user.data.approval)
            : sortingOption === 'notApproved'
            ? userData.filter((user) => !user.data.approval)
            : userData;

        setUsers(filteredUsers);
      })
      .catch((error) => console.log(error.message));
  }

  async function handleToggleApproval(userId, newApprovalStatus) {
    try {
      const userDocRef = doc(db, '2024', 'general', 'rccs_users', userId);
      await updateDoc(userDocRef, {
        approval: newApprovalStatus,
      });
      getUsers(); // Refresh the data after updating approval status
    } catch (error) {
      console.error('Error updating approval status: ', error.message);
    }
  }

  async function handleSaveEdit(userId) {
    try {
      const userDocRef = doc(db, '2024', 'general', 'rccs_users', userId);
      await updateDoc(userDocRef, {
        name: editedName,
        age: editedAge,
        approval: editedApproval,
      });

      setEditingUserId(null);
      setEditedName('');
      setEditedAge('');
      setEditedApproval(false);
      getUsers(); // Refresh the data after saving changes
    } catch (error) {
      console.error('Error updating document: ', error.message);
    }
  }

  async function handleDeleteUser(userId) {
    try {
      const userDocRef = doc(db, '2024', 'general', 'rccs_users', userId);
      await deleteDoc(userDocRef);
      getUsers(); // Refresh the data after deleting the user
    } catch (error) {
      console.error('Error deleting document: ', error.message);
    }
  }

  function handleCancelEdit() {
    setEditingUserId(null);
    setEditedName('');
    setEditedAge('');
    setEditedApproval(false);
  }

  function handleEditUser(userId, name, age, approval) {
    setEditingUserId(userId);
    setEditedName(name);
    setEditedAge(age);
    setEditedApproval(approval);
  }

  function handleApproveAllNotApproved() {
    // Find all not approved users and update their approval status to true
    const notApprovedUsers = users.filter((user) => !user.data.approval);
    notApprovedUsers.forEach(async (user) => {
      await handleToggleApproval(user.id, true);
    });
  }

  return (
    <div>
      <h1>ListUsers</h1>

      <button onClick={() => setSortingOption('all')}>All Users</button>
      <button onClick={() => setSortingOption('approved')}>Approved Users</button>
      <button onClick={() => setSortingOption('notApproved')}>Not Approved Users</button>
      {sortingOption === 'notApproved' && (
        <button onClick={handleApproveAllNotApproved}>Approve All Not Approved</button>
      )}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Approval</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>
                {editingUserId === user.id ? (
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                  />
                ) : (
                  user.data.name
                )}
              </td>
              <td>
                {editingUserId === user.id ? (
                  <input
                    type="text"
                    value={editedAge}
                    onChange={(e) => setEditedAge(e.target.value)}
                  />
                ) : (
                  user.data.age
                )}
              </td>
              <td>
                {editingUserId === user.id ? (
                  <input
                    type="checkbox"
                    checked={editedApproval}
                    onChange={(e) => setEditedApproval(e.target.checked)}
                  />
                ) : (
                  user.data.approval ? 'Approved' : 'Not Approved'
                )}
              </td>
              <td>
                {editingUserId === user.id ? (
                  <>
                    <button onClick={() => handleSaveEdit(user.id)}>Save</button>
                    <button onClick={handleCancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEditUser(user.id, user.data.name, user.data.age, user.data.approval)}>
                      Edit
                    </button>
                    <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
