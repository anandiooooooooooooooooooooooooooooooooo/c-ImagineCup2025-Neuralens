# NeuraLens Dashboard - Enhanced UI

## 🎨 Premium Design Features

The NeuraLens dashboard features a modern, premium design with:

### Visual Design
- **Blue & Orange Gradient Theme**: Professional color palette representing technology and warmth
- **Glassmorphism Effects**: Modern frosted glass aesthetic with backdrop blur
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Dark Mode Optimized**: Eye-friendly dark theme for extended use

### Key Components

#### 1. **Stats Cards**
- Real-time metrics display
- Gradient backgrounds with glow effects
- Icon-based visual hierarchy
- Trend indicators

#### 2. **Risk Distribution Bars**
- Animated progress bars
- Color-coded risk levels (Green/Yellow/Red)
- Percentage-based visualization
- Student count display

#### 3. **Behavioral Trends Chart**
- Line chart using Chart.js
- Dual metrics: Attention Level & Movement Intensity
- Time-based x-axis
- Gradient fill areas

#### 4. **Video Upload Interface**
- Drag-and-drop zone
- Hover effects
- File format validation
- Progress indicators (future)

### Design System

#### Colors
```css
--primary-blue: #2563eb
--accent-orange: #f97316
--success: #10b981
--warning: #f59e0b
--danger: #ef4444
```

#### Typography
- **Display Font**: Space Grotesk (headings)
- **Body Font**: Inter (content)
- **Responsive sizing**: clamp() for fluid typography

#### Spacing
- Consistent 8px grid system
- Responsive padding/margins
- Container max-width: 1400px

### Animations

#### Framer Motion Variants
- **Stagger Children**: Sequential card animations
- **Fade In**: Smooth opacity transitions
- **Slide In**: Directional entrance effects

#### CSS Animations
- **Shimmer**: Loading state effects
- **Pulse**: Attention-grabbing elements
- **Spin**: Loading spinners

### Responsive Design

#### Breakpoints
- **Desktop**: 1024px+
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px

#### Adaptive Layouts
- Grid columns collapse on mobile
- Touch-friendly button sizes
- Optimized font sizes

### Accessibility

- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard access
- **Color Contrast**: WCAG AA compliant
- **Focus Indicators**: Visible focus states

## 🚀 Running the Dashboard

### Development Mode
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📦 Dependencies

### Core
- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool

### UI Components
- **@fluentui/react-components**: Microsoft Fluent UI
- **lucide-react**: Modern icon library
- **framer-motion**: Animation library

### Data Visualization
- **chart.js**: Charting library
- **react-chartjs-2**: React wrapper for Chart.js

### Utilities
- **date-fns**: Date formatting

## 🎯 Features Implemented

### Dashboard View
- [x] Stats cards with real-time metrics
- [x] Risk distribution visualization
- [x] Behavioral trends chart
- [x] Privacy notice banner
- [x] Smooth page transitions

### Upload View
- [x] Drag-and-drop zone
- [x] File format validation UI
- [x] Upload button
- [ ] Progress tracking (future)
- [ ] Real-time processing status (future)

### Analytics View
- [ ] Detailed student profiles (future)
- [ ] Historical trend analysis (future)
- [ ] Export reports (future)

## 🔮 Future Enhancements

### Phase 2
- Real-time WebSocket updates
- Student risk cards with drill-down
- Classroom heatmap visualization
- Advanced filtering and search

### Phase 3
- Multi-session comparison
- PDF report generation
- Email notifications
- Role-based access control

## 🎨 Design Principles

1. **Privacy-First**: Clear non-diagnostic messaging
2. **Educator-Friendly**: No technical jargon
3. **Data-Driven**: Visual insights over raw numbers
4. **Responsive**: Works on all devices
5. **Accessible**: WCAG compliant

## 📱 Screenshots

### Dashboard View
- Stats overview
- Risk distribution
- Behavioral trends

### Upload View
- Video upload interface
- Processing status

### Analytics View
- Coming soon...

## 🛠️ Customization

### Changing Colors
Edit `src/globals.css`:
```css
:root {
  --primary-blue: #your-color;
  --accent-orange: #your-color;
}
```

### Adding New Charts
```tsx
import { Line, Bar, Pie } from 'react-chartjs-2';
// Register additional Chart.js components as needed
```

### Custom Animations
```tsx
import { motion } from 'framer-motion';

const customVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 }
};
```

## 📄 License

MIT License - See LICENSE.md

---

**Built with ❤️ for educators and students worldwide**