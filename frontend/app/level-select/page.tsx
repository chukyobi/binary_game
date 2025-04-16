'use client';

import LevelSelect from '../components/LevelSelect';
import ProtectedRoute from '../components/ProtectedRoute';

export default function LevelSelectPage() {
  return (
    <ProtectedRoute>
      <LevelSelect />
    </ProtectedRoute>
  );
} 