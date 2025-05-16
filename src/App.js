import { useEffect, useState } from 'react';
import supabase from './supabase';
import { useAuth } from './AuthContext';
import { UserMenu } from './AuthComponents';

import './style.css';

function App() {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [theme, setTheme] = useState(() => {
    // Check for saved theme preference, default to 'dark'
    return localStorage.getItem('theme') || 'dark';
  });
  const { user } = useAuth();

  // Apply theme when it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(
    function () {
      async function getFacts() {
        setIsLoading(true);

        let query = supabase.from('facts').select('*');

        if (currentCategory !== 'all')
          query = query.eq('category', currentCategory);

        const { data: facts, error } = await query
          .order('votesInteresting', { ascending: false })
          .limit(1000);

        if (!error) setFacts(facts);
        else alert('There was a problem getting data');
        setIsLoading(false);
      }
      getFacts();
    },
    [currentCategory]
  );

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <Header 
        showForm={showForm} 
        setShowForm={setShowForm} 
        theme={theme} 
        toggleTheme={toggleTheme}
      />
      {showForm ? (
        <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
      ) : null}

      <main className='main'>
        <CategoryFilter setCurrentCategory={setCurrentCategory} />

        {isLoading ? (
          <Loader />
        ) : (
          <FactList facts={facts} setFacts={setFacts} />
        )}
      </main>
    </>
  );
}

function Loader() {
  return (
    <div className='loader-container'>
      <div className='loader'></div>
      <p className='message'>Loading facts...</p>
    </div>
  );
}

function Header({ showForm, setShowForm, theme, toggleTheme }) {
  const appTitle = 'Today I Learned';
  const { user } = useAuth();

  return (
    <header className='header'>
      <div className='logo'>
        <img src='logo.png' height='68' width='68' alt='Today I Learned Logo' />
        <h1>{appTitle}</h1>
      </div>
      
      <div className="header-right">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        <UserMenu />
        
        <button
          className='btn btn-large btn-open'
          onClick={() => setShowForm((show) => !show)}
        >
          {showForm ? 'Close' : 'Share a fact'}
        </button>
      </div>
    </header>
  );
}

function ThemeToggle({ theme, toggleTheme }) {
  return (
    <div className="theme-switch-wrapper">
      <button 
        className="theme-switch" 
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? (
          <span className="theme-icon">☀️</span>
        ) : (
          <span className="theme-icon">🌙</span>
        )}
      </button>
    </div>
  );
}

const CATEGORIES = [
  { name: 'technology', color: '#3b82f6' },
  { name: 'science', color: '#16a34a' },
  { name: 'finance', color: '#ef4444' },
  { name: 'society', color: '#eab308' },
  { name: 'entertainment', color: '#db2777' },
  { name: 'health', color: '#14b8a6' },
  { name: 'history', color: '#f97316' },
  { name: 'news', color: '#8b5cf6' },
];

function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
}

function NewFactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState('');
  const [source, setSource] = useState('');
  const [category, setCategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const textLength = text.length;
  const { user } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Check if user is logged in
    if (!user) {
      alert('Please log in to share a fact');
      return;
    }

    if (text && isValidHttpUrl(source) && category && textLength <= 200) {
      setIsUploading(true);
      
      // First, check if a fact with the same text already exists
      const { data: existingFacts, error: checkError } = await supabase
        .from('facts')
        .select('id')
        .eq('text', text.trim())
        .limit(1);
      
      if (checkError) {
        alert('Error checking for duplicate facts');
        setIsUploading(false);
        return;
      }
      
      // If a fact with the same text exists, show an alert and don't insert
      if (existingFacts && existingFacts.length > 0) {
        alert('This fact already exists in the database!');
        setIsUploading(false);
        return;
      }
      
      // If no duplicate found, insert the new fact
      const { data: newFact, error } = await supabase
        .from('facts')
        .insert([{ 
          text: text.trim(), 
          source, 
          category,
          user_id: user.id // Associate fact with user
        }])
        .select();
      
      setIsUploading(false);

      if (!error) setFacts((facts) => [newFact[0], ...facts]);
      else alert('There was a problem adding your fact');

      setText('');
      setSource('');
      setCategory('');
      setShowForm(false);
    }
  }

  return (
    <form className='fact-form' onSubmit={handleSubmit}>
      <input
        type='text'
        placeholder='Share a fact with the world...'
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isUploading}
      />
      <span className={textLength > 180 ? 'text-count warning' : 'text-count'}>
        {200 - textLength}
      </span>
      <input
        value={source}
        type='text'
        placeholder='Trustworthy source...'
        onChange={(e) => setSource(e.target.value)}
        disabled={isUploading}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={isUploading}
      >
        <option value=''>Choose category:</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button className='btn btn-large' disabled={isUploading}>
        {isUploading ? 'Posting...' : 'Post'}
      </button>
    </form>
  );
}

function CategoryFilter({ setCurrentCategory }) {
  const [activeCategory, setActiveCategory] = useState('all');

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    setCurrentCategory(category);
  };

  return (
    <aside>
      <ul className="category-list">
        <li className='category'>
          <button
            className={`btn btn-all-categories ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleCategoryClick('all')}
          >
            All
          </button>
        </li>

        {CATEGORIES.map((cat) => (
          <li key={cat.name} className='category'>
            <button
              className={`btn btn-category ${activeCategory === cat.name ? 'active' : ''}`}
              style={{ backgroundColor: cat.color }}
              onClick={() => handleCategoryClick(cat.name)}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function FactList({ facts, setFacts }) {
  if (facts.length === 0)
    return (
      <p className='message'>
        No facts for this category yet! Create the first one ✌️
      </p>
    );

  return (
    <section className="facts-section">
      <ul className='facts-list'>
        {facts.map((fact) => (
          <Fact key={fact.id} fact={fact} setFacts={setFacts} />
        ))}
      </ul>
      <p className="facts-count">There are {facts.length} facts in the database. Add your own!</p>
    </section>
  );
}

function Fact({ fact, setFacts }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();
  const [userVotes, setUserVotes] = useState(null);
  const isDisputed =
    fact.votesInteresting + fact.votesMindblowing < fact.votesFalse;

  // Check if user has voted on this fact
  useEffect(() => {
    async function checkUserVote() {
      if (!user) {
        setUserVotes(null);
        return;
      }
      
      const { data, error } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('fact_id', fact.id)
        .eq('user_id', user.id)
        .single();
      
      if (!error && data) {
        setUserVotes(data.vote_type);
      } else {
        setUserVotes(null);
      }
    }
    
    checkUserVote();
  }, [fact.id, user]);

  async function handleVote(voteType) {
    if (!user) {
      alert('Please log in to vote');
      return;
    }

    setIsUpdating(true);
    
    try {
      // If user already voted
      if (userVotes) {
        // If clicking the same vote type, remove the vote
        if (userVotes === voteType) {
          // Remove user vote from votes table
          const { error: deleteError } = await supabase
            .from('votes')
            .delete()
            .eq('fact_id', fact.id)
            .eq('user_id', user.id);
            
          if (deleteError) throw deleteError;
          
          // Decrement vote count
          const { data: updatedFact, error: updateError } = await supabase
            .from('facts')
            .update({ [voteType]: fact[voteType] - 1 })
            .eq('id', fact.id)
            .select();
            
          if (updateError) throw updateError;
            
          if (updatedFact) {
            setFacts((facts) =>
              facts.map((f) => (f.id === fact.id ? updatedFact[0] : f))
            );
            setUserVotes(null);
          }
        } 
        // If clicking different vote type, change the vote
        else {
          // Update user vote in votes table
          const { error: updateVoteError } = await supabase
            .from('votes')
            .update({ vote_type: voteType })
            .eq('fact_id', fact.id)
            .eq('user_id', user.id);
            
          if (updateVoteError) throw updateVoteError;
          
          // Decrement old vote type and increment new vote type
          const { data: updatedFact, error: updateFactError } = await supabase
            .from('facts')
            .update({ 
              [userVotes]: fact[userVotes] - 1,
              [voteType]: fact[voteType] + 1 
            })
            .eq('id', fact.id)
            .select();
            
          if (updateFactError) throw updateFactError;
            
          if (updatedFact) {
            setFacts((facts) =>
              facts.map((f) => (f.id === fact.id ? updatedFact[0] : f))
            );
            setUserVotes(voteType);
          }
        }
      } 
      // If user hasn't voted yet
      else {
        // Insert new vote in votes table
        const { error: insertError } = await supabase
          .from('votes')
          .insert([{ 
            fact_id: fact.id,
            user_id: user.id,
            vote_type: voteType
          }])
          .select();
          
        if (insertError) {
          // If error is due to conflict, it means user already voted
          // This is a safeguard in case our UI state gets out of sync
          console.error('Insert vote error:', insertError);
          if (insertError.code === '23505') { // Unique violation error
            alert('You have already voted on this fact. Please refresh the page.');
            setIsUpdating(false);
            return;
          }
          throw insertError;
        }
        
        // Increment vote count
        const { data: updatedFact, error: updateError } = await supabase
          .from('facts')
          .update({ [voteType]: fact[voteType] + 1 })
          .eq('id', fact.id)
          .select();
          
        if (updateError) throw updateError;
          
        if (updatedFact) {
          setFacts((facts) =>
            facts.map((f) => (f.id === fact.id ? updatedFact[0] : f))
          );
          setUserVotes(voteType);
        }
      }
    } catch (error) {
      console.error('Error handling vote:', error);
      alert('There was a problem with your vote: ' + (error.message || 'Unknown error'));
      // Refresh the user's vote state to be safe
      const { data } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('fact_id', fact.id)
        .eq('user_id', user.id)
        .single();
        
      if (data) {
        setUserVotes(data.vote_type);
      } else {
        setUserVotes(null);
      }
    }
    
    setIsUpdating(false);
  }

  return (
    <li className='fact'>
      <p>
        {isDisputed ? <span className='disputed'>[⛔️ DISPUTED]</span> : null}
        {fact.text}
        <a className='source' href={fact.source} target='_blank' rel="noopener noreferrer">
          (Source)
        </a>
      </p>
      <span
        className='tag'
        style={{
          backgroundColor: CATEGORIES.find((cat) => cat.name === fact.category)
            ?.color,
        }}
      >
        {fact.category}
      </span>
      <div className='vote-buttons'>
        <button
          className={`vote-btn ${userVotes === 'votesInteresting' ? 'voted' : ''}`}
          onClick={() => handleVote('votesInteresting')}
          disabled={isUpdating}
          title="Interesting"
        >
          👍 {fact.votesInteresting || 0}
        </button>
        <button
          className={`vote-btn ${userVotes === 'votesMindblowing' ? 'voted' : ''}`}
          onClick={() => handleVote('votesMindblowing')}
          disabled={isUpdating}
          title="Mind Blowing"
        >
          🤯 {fact.votesMindblowing || 0}
        </button>
        <button 
          className={`vote-btn ${userVotes === 'votesFalse' ? 'voted' : ''}`}
          onClick={() => handleVote('votesFalse')} 
          disabled={isUpdating}
          title="Not True"
        >
          ⛔️ {fact.votesFalse || 0}
        </button>
      </div>
    </li>
  );
}

export default App;