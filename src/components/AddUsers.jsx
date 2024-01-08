import React, { useState, useEffect } from 'react';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export default function AddUsers() {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [currentIds, setCurrentIds] = useState([]);

    useEffect(() => {
        async function fetchCurrentIds() {
            const userCollectionRef = collection(db, '2024', 'general', 'rccs_users');
            const querySnapshot = await getDocs(userCollectionRef);
            const ids = querySnapshot.docs.map((doc) => parseInt(doc.id.replace('rccs_', ''), 10));
            setCurrentIds(ids);
        }

        fetchCurrentIds();
    }, []); // Fetch current IDs on component mount

    async function handleSubmit(e) {
        e.preventDefault();

        if (name === '' || age === '') {
            return;
        }

        const maxId = currentIds.length > 0 ? Math.max(...currentIds) : 0;
        const newId = maxId + 1;

        const userCollectionRef = collection(db, '2024', 'general', 'rccs_users');
        const newDocRef = doc(userCollectionRef, `rccs_${String(newId).padStart(3, '0')}`);

        try {
            await setDoc(newDocRef, { name, age: parseInt(age, 10) });
            alert(name);
            // Update the currentIds state to include the new ID
            setCurrentIds([...currentIds, newId]);
        } catch (error) {
            console.error('Error adding document: ', error);
        }
    }

    return (
        <div>
            <h1>AddUsers</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="name">User Name</label>
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} />

                <label htmlFor="age">User Age</label>
                <input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />

                <button type="submit">Submit</button>
            </form>
        </div>
    );
}
