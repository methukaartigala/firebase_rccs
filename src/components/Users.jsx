import React, { useState } from 'react';
import ListUsers from './ListUsers';
import AddUsers from './AddUsers';

export default function Users() {
  const [isAddUsersVisible, setAddUsersVisible] = useState(false);

  const handleAddUsersClick = () => {
    setAddUsersVisible(true);
  };

  return (
    <div>
      <ListUsers />

      {isAddUsersVisible && <AddUsers />}

      <button onClick={handleAddUsersClick}>Add users</button>
    </div>
  );
}
