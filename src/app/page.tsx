import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function Home() {
  return (
    <DashboardLayout title="UI Verification Gallery">
      <div className="space-y-6 max-w-4xl mx-auto">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Introduction</h2>
          <p className="text-muted-foreground">
            This page demonstrates the core "Abricot" UI components within the global dashboard layout.
          </p>
        </section>

        <section className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Different variants of our button component.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button variant="primary">Primary (Abricot)</Button>
              <Button variant="secondary">Secondary (Black)</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="primary" disabled>Disabled</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inputs</CardTitle>
              <CardDescription>Standard form inputs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="grid w-full items-center gap-1.5">
                <label htmlFor="email" className="text-sm font-medium leading-none">Email</label>
                <Input type="email" id="email" placeholder="Email" />
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}
