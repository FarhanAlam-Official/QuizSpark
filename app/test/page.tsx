'use client';

import { useApp } from '@/lib/context/AppContext';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function TestPage() {
  const { students, addStudent } = useApp();
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGroup, setNewStudentGroup] = useState('');

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addStudent({
        name: newStudentName,
        group: newStudentGroup
      });
      setNewStudentName('');
      setNewStudentGroup('');
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test JSON Server Integration</h1>
      
      {/* Add Student Form */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Student</h2>
        <form onSubmit={handleAddStudent} className="space-y-4">
          <div>
            <label className="block mb-2">Name:</label>
            <input
              type="text"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="border p-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-2">Group:</label>
            <input
              type="text"
              value={newStudentGroup}
              onChange={(e) => setNewStudentGroup(e.target.value)}
              className="border p-2 rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Student
          </button>
        </form>
      </div>

      {/* Display Students */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Current Students</h2>
        <div className="space-y-2">
          {students.map((student) => (
            <div
              key={student.id}
              className="border p-4 rounded"
            >
              <p><strong>Name:</strong> {student.name}</p>
              <p><strong>Group:</strong> {student.group}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 