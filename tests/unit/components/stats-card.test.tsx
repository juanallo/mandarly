import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Activity } from 'lucide-react';

describe('StatsCard', () => {
  it('should render title and value', () => {
    render(
      <StatsCard
        title="Total Tasks"
        value={42}
        icon={Activity}
      />
    );

    expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should render icon', () => {
    const { container } = render(
      <StatsCard
        title="Total Tasks"
        value={42}
        icon={Activity}
      />
    );

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should render trend indicator with positive change', () => {
    const trend = {
      current: 50,
      previous: 40,
      change: 25,
      direction: 'up' as const,
    };

    render(
      <StatsCard
        title="Total Tasks"
        value={50}
        icon={Activity}
        trend={trend}
      />
    );

    expect(screen.getByText('+25.0%')).toBeInTheDocument();
  });

  it('should render trend indicator with negative change', () => {
    const trend = {
      current: 30,
      previous: 40,
      change: -25,
      direction: 'down' as const,
    };

    render(
      <StatsCard
        title="Total Tasks"
        value={30}
        icon={Activity}
        trend={trend}
      />
    );

    expect(screen.getByText('-25.0%')).toBeInTheDocument();
  });

  it('should render trend indicator with stable state', () => {
    const trend = {
      current: 40,
      previous: 40,
      change: 0,
      direction: 'stable' as const,
    };

    render(
      <StatsCard
        title="Total Tasks"
        value={40}
        icon={Activity}
        trend={trend}
      />
    );

    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });

  it('should apply green color for upward trend', () => {
    const trend = {
      current: 50,
      previous: 40,
      change: 25,
      direction: 'up' as const,
    };

    const { container } = render(
      <StatsCard
        title="Total Tasks"
        value={50}
        icon={Activity}
        trend={trend}
      />
    );

    const trendElement = container.querySelector('.text-green-600');
    expect(trendElement).toBeInTheDocument();
  });

  it('should apply red color for downward trend', () => {
    const trend = {
      current: 30,
      previous: 40,
      change: -25,
      direction: 'down' as const,
    };

    const { container } = render(
      <StatsCard
        title="Total Tasks"
        value={30}
        icon={Activity}
        trend={trend}
      />
    );

    const trendElement = container.querySelector('.text-red-600');
    expect(trendElement).toBeInTheDocument();
  });

  it('should render description text', () => {
    render(
      <StatsCard
        title="Total Tasks"
        value={42}
        icon={Activity}
        description="All time"
      />
    );

    expect(screen.getByText('All time')).toBeInTheDocument();
  });

  it('should render default description with trend', () => {
    const trend = {
      current: 50,
      previous: 40,
      change: 25,
      direction: 'up' as const,
    };

    render(
      <StatsCard
        title="Total Tasks"
        value={50}
        icon={Activity}
        trend={trend}
      />
    );

    expect(screen.getByText('vs last week')).toBeInTheDocument();
  });

  it('should render loading skeleton when isLoading is true', () => {
    const { container } = render(
      <StatsCard
        title="Total Tasks"
        value={42}
        icon={Activity}
        isLoading={true}
      />
    );

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should apply custom className', () => {
    const { container } = render(
      <StatsCard
        title="Total Tasks"
        value={42}
        icon={Activity}
        className="custom-class"
      />
    );

    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
  });

  it('should have hover effect', () => {
    const { container } = render(
      <StatsCard
        title="Total Tasks"
        value={42}
        icon={Activity}
      />
    );

    const card = container.firstChild;
    expect(card).toHaveClass('hover:shadow-md');
  });
});
