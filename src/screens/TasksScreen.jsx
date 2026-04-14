import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import { JobService } from '../services/jobService';

const TasksScreen = ({ setActive }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      const data = await JobService.getTasks('1');
      setTasks(data);
      setLoading(false);
    };
    loadTasks();
  }, []);

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className="fade-in" style={{ height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 20px 10px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div 
            onClick={() => setActive('My Jobs')}
            style={{ width: 32, height: 32, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <span style={{ fontSize: 14 }}>←</span>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#111' }}>Task List</div>
            <div style={{ fontSize: 12, color: '#888' }}>Active Gig Assignment</div>
          </div>
        </div>

        {/* Progress Card */}
        <div style={{ 
          marginTop: 20, 
          background: '#5B3FC8', 
          borderRadius: 20, 
          padding: '20px', 
          color: '#fff',
          boxShadow: '0 8px 16px rgba(91, 63, 200, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.8, letterSpacing: 1 }}>OVERALL PROGRESS</div>
              <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{completedCount} / {tasks.length} Done</div>
            </div>
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: 14 }}>{Math.round(progress)}%</span>
            </div>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#fff', borderRadius: 10, transition: 'width 0.4s ease-out' }} />
          </div>
        </div>
      </div>

      <div className="full-height-scroll" style={{ padding: '10px 20px' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#888', marginBottom: 15, marginTop: 10 }}>THINGS TO DO TODAY</div>
        
        {loading ? (
          [1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 75, borderRadius: 16, marginBottom: 12 }} />)
        ) : (
          tasks.map(task => (
            <div 
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="tap-effect"
              style={{ 
                background: '#fff', 
                border: '1.5px solid #F0F0F0', 
                borderRadius: 18, 
                padding: '16px', 
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 15,
                opacity: task.completed ? 0.7 : 1,
                cursor: 'pointer'
              }}
            >
              <div style={{ 
                width: 28, 
                height: 28, 
                borderRadius: 8, 
                border: task.completed ? 'none' : '2px solid #E5E7EB',
                background: task.completed ? '#22c55e' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {task.completed && <span style={{ color: '#fff', fontSize: 14 }}>✓</span>}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: 14, 
                  fontWeight: 700, 
                  color: task.completed ? '#888' : '#111',
                  textDecoration: task.completed ? 'line-through' : 'none'
                }}>
                  {task.title}
                </div>
                {task.requiresPhoto && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <span style={{ fontSize: 10 }}>📸</span>
                    <span style={{ fontSize: 9, color: '#5B3FC8', fontWeight: 700 }}>PHOTO PROOF REQUIRED</span>
                  </div>
                )}
              </div>

              {!task.completed && task.requiresPhoto && (
                <div className="tap-effect" style={{ width: 34, height: 34, borderRadius: 10, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 14 }}>📷</span>
                </div>
              )}
            </div>
          ))
        )}

        <div style={{ height: 100 }} />
      </div>

      {progress === 100 && (
        <div 
          className="fade-in"
          style={{ 
            position: 'fixed', 
            bottom: 100, 
            left: 20, 
            right: 20, 
            background: '#22c55e', 
            padding: '16px', 
            borderRadius: 18, 
            color: '#fff', 
            textAlign: 'center',
            fontWeight: 800,
            boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)',
            zIndex: 100
          }}
        >
          ✨ ALL TASKS COMPLETED!
        </div>
      )}

      <NavBar active="My Jobs" setActive={setActive} />
    </div>
  );
};

export default TasksScreen;
