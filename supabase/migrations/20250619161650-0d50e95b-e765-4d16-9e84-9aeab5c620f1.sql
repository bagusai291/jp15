
-- Update RLS policies for orders table to allow proper order creation
DROP POLICY IF EXISTS "Users see own orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

-- Create new policies that properly handle both authenticated and guest orders
CREATE POLICY "Users can view their own orders or admins can view all" 
  ON public.orders 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    user_id IS NULL OR 
    public.is_admin()
  );

CREATE POLICY "Anyone can create orders (authenticated or guest)" 
  ON public.orders 
  FOR INSERT 
  WITH CHECK (
    -- Allow if user_id matches authenticated user, or if user_id is null for guest orders
    auth.uid() = user_id OR user_id IS NULL
  );

CREATE POLICY "Admins can update any order" 
  ON public.orders 
  FOR UPDATE 
  USING (public.is_admin());

-- Also ensure admins can delete orders if needed
CREATE POLICY "Admins can delete orders" 
  ON public.orders 
  FOR DELETE 
  USING (public.is_admin());
