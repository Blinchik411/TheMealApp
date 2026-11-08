import type { Meta, StoryObj } from '@storybook/react';
import { Footer } from './Footer';

const meta: Meta<typeof Footer> = {
  title: 'Widgets/Footer',
  component: Footer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Footer>;

export const Default: Story = {};

export const HoverActive: Story = {
  parameters: {
    pseudo: { hover: true, active: true },
  },
};

export const Loading: Story = {
  render: () => (
    <footer className="w-full border-t border-border bg-card/50 p-8 space-y-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-border/70 bg-card/60 p-6 space-y-3">
          <div className="h-6 w-32 bg-muted rounded-md animate-pulse" />
          <div className="h-4 w-48 bg-muted/60 rounded-md animate-pulse" />
          <div className="h-14 w-full bg-muted/60 rounded-md animate-pulse" />
        </div>
        <div className="rounded-2xl border border-border/70 bg-card/60 p-6 space-y-3">
          <div className="h-4 w-24 bg-muted rounded-md animate-pulse" />
          <div className="flex gap-2">
            <div className="h-7 w-20 bg-muted/60 rounded-xl animate-pulse" />
            <div className="h-7 w-20 bg-muted/60 rounded-xl animate-pulse" />
          </div>
          <div className="h-4 w-28 bg-muted/60 rounded-md animate-pulse" />
        </div>
        <div className="rounded-2xl border border-border/70 bg-card/60 p-6 space-y-3">
          <div className="h-4 w-24 bg-muted rounded-md animate-pulse" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-10 bg-muted/60 rounded-xl animate-pulse" />
            <div className="h-10 bg-muted/60 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </footer>
  ),
};

export const Disabled: Story = {
  args: {
    className: 'opacity-50 pointer-events-none select-none',
  },
};

export const WithError: Story = {
  render: () => (
    <div className="relative">
      <div className="bg-destructive/10 border-b border-destructive/20 text-destructive text-xs py-2 px-4 text-center font-medium">
        Failed to sync with culinary service. Displaying cached navigation.
      </div>
      <Footer />
    </div>
  ),
};
