import {
	Building2,
	Check,
	CreditCard,
	Plus,
	Trash2,
	Wallet,
} from "lucide-react";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	useCreatePaymentMethod,
	useDeletePaymentMethod,
	usePaymentMethods,
	useSetDefaultPaymentMethod,
} from "@/hooks/use-payment-methods";
import { useToast } from "@/hooks/use-toast";
import { useLoggedInUser } from "@/hooks/useLoggedInUser";
import {
	BankAccountType,
	CreatePaymentMethodData,
	PaymentMethod,
	PaymentMethodType,
} from "@/types";

export function PaymentMethods() {
	const { data: user } = useLoggedInUser();
	const { data: paymentMethods, isLoading } = usePaymentMethods(
		user?.id?.toString() || "",
	);
	const createMutation = useCreatePaymentMethod();
	const deleteMutation = useDeletePaymentMethod();
	const setDefaultMutation = useSetDefaultPaymentMethod();
	const { toast } = useToast();

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [methodType, setMethodType] = useState<PaymentMethodType>("paypal");
	const [formData, setFormData] = useState<CreatePaymentMethodData>({});
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [methodToDelete, setMethodToDelete] = useState<string | null>(null);
	const [defaultDialogOpen, setDefaultDialogOpen] = useState(false);
	const [methodToSetDefault, setMethodToSetDefault] = useState<string | null>(
		null,
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			await createMutation.mutateAsync(formData);
			toast({
				title: "Success",
				description: "Payment method added successfully",
			});
			setIsDialogOpen(false);
			setFormData({});
		} catch (error) {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		}
	};

	const handleDelete = async (id: string) => {
		setMethodToDelete(id);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (!methodToDelete) return;

		try {
			await deleteMutation.mutateAsync(methodToDelete);
			toast({
				title: "Success",
				description: "Payment method deleted successfully",
			});
			setDeleteDialogOpen(false);
			setMethodToDelete(null);
		} catch (error) {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		}
	};

	const handleSetDefault = async (id: string) => {
		setMethodToSetDefault(id);
		setDefaultDialogOpen(true);
	};

	const confirmSetDefault = async () => {
		if (!methodToSetDefault) return;

		try {
			await setDefaultMutation.mutateAsync(methodToSetDefault);
			toast({
				title: "Success",
				description: "Default payment method updated",
			});
			setDefaultDialogOpen(false);
			setMethodToSetDefault(null);
		} catch (error) {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		}
	};

	const getPaymentMethodDisplay = (method: PaymentMethod) => {
		if (method.paypal_email) {
			return (
				<div className="flex items-center gap-3">
					<CreditCard className="w-5 h-5 text-blue-500" />
					<div>
						<p className="font-medium">PayPal</p>
						<p className="text-sm text-muted-foreground">
							{method.paypal_email}
						</p>
					</div>
				</div>
			);
		}

		if (method.bank_account_number) {
			return (
				<div className="flex items-center gap-3">
					<Building2 className="w-5 h-5 text-green-500" />
					<div>
						<p className="font-medium">{method.bank_name}</p>
						<p className="text-sm text-muted-foreground">
							****{method.bank_account_number.slice(-4)}
						</p>
						<p className="text-sm text-muted-foreground">
							{method.bank_account_holder}
						</p>
					</div>
				</div>
			);
		}

		if (method.wallet_address) {
			return (
				<div className="flex items-center gap-3">
					<Wallet className="w-5 h-5 text-orange-500" />
					<div>
						<p className="font-medium">{method.wallet_type}</p>
						<p className="text-sm text-muted-foreground">
							{method.wallet_address.slice(0, 20)}...
						</p>
					</div>
				</div>
			);
		}

		return null;
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Payment Methods</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-4">
						<div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
						<p className="text-sm text-muted-foreground">
							Loading payment methods...
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle>Payment Methods</CardTitle>
					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button size="sm">
								<Plus className="w-4 h-4 mr-2" />
								Add Method
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-md">
							<DialogHeader>
								<DialogTitle>Add Payment Method</DialogTitle>
							</DialogHeader>

							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<Label>Payment Type</Label>
									<Select
										value={methodType}
										onValueChange={(value: PaymentMethodType) =>
											setMethodType(value)
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="paypal">PayPal</SelectItem>
											<SelectItem value="bank">Bank Account</SelectItem>
											<SelectItem value="crypto">Cryptocurrency</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{methodType === "paypal" && (
									<div>
										<Label htmlFor="paypal_email">PayPal Email</Label>
										<Input
											id="paypal_email"
											type="email"
											value={formData.paypal_email || ""}
											onChange={(e) =>
												setFormData({
													...formData,
													paypal_email: e.target.value,
												})
											}
											required
										/>
									</div>
								)}

								{methodType === "bank" && (
									<div className="space-y-4">
										<div>
											<Label htmlFor="bank_account_holder">
												Account Holder Name
											</Label>
											<Input
												id="bank_account_holder"
												value={formData.bank_account_holder || ""}
												onChange={(e) =>
													setFormData({
														...formData,
														bank_account_holder: e.target.value,
													})
												}
												required
											/>
										</div>
										<div>
											<Label htmlFor="bank_account_number">
												Account Number
											</Label>
											<Input
												id="bank_account_number"
												value={formData.bank_account_number || ""}
												onChange={(e) =>
													setFormData({
														...formData,
														bank_account_number: e.target.value,
													})
												}
												required
											/>
										</div>
										<div>
											<Label htmlFor="bank_name">Bank Name</Label>
											<Input
												id="bank_name"
												value={formData.bank_name || ""}
												onChange={(e) =>
													setFormData({
														...formData,
														bank_name: e.target.value,
													})
												}
												required
											/>
										</div>
										<div>
											<Label htmlFor="bank_ifsc_code">IFSC Code</Label>
											<Input
												id="bank_ifsc_code"
												value={formData.bank_ifsc_code || ""}
												onChange={(e) =>
													setFormData({
														...formData,
														bank_ifsc_code: e.target.value,
													})
												}
												required
											/>
										</div>
										<div>
											<Label htmlFor="bank_swift_code">
												SWIFT Code (Optional)
											</Label>
											<Input
												id="bank_swift_code"
												value={formData.bank_swift_code || ""}
												onChange={(e) =>
													setFormData({
														...formData,
														bank_swift_code: e.target.value,
													})
												}
											/>
										</div>
										<div>
											<Label>Account Type</Label>
											<Select
												value={formData.bank_account_type || "savings"}
												onValueChange={(value: BankAccountType) =>
													setFormData({ ...formData, bank_account_type: value })
												}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="savings">Savings</SelectItem>
													<SelectItem value="current">Current</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
								)}

								{methodType === "crypto" && (
									<div className="space-y-4">
										<div>
											<Label htmlFor="wallet_address">Wallet Address</Label>
											<Input
												id="wallet_address"
												value={formData.wallet_address || ""}
												onChange={(e) =>
													setFormData({
														...formData,
														wallet_address: e.target.value,
													})
												}
												required
											/>
										</div>
										<div>
											<Label htmlFor="wallet_type">Wallet Type</Label>
											<Input
												id="wallet_type"
												placeholder="e.g., Bitcoin, Ethereum, USDT"
												value={formData.wallet_type || ""}
												onChange={(e) =>
													setFormData({
														...formData,
														wallet_type: e.target.value,
													})
												}
												required
											/>
										</div>
									</div>
								)}

								<div className="flex gap-2 pt-4">
									<Button type="submit" disabled={createMutation.isPending}>
										{createMutation.isPending ? "Adding..." : "Add Method"}
									</Button>
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsDialogOpen(false)}
									>
										Cancel
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{paymentMethods?.map((method) => (
						<div
							key={method.id}
							className="flex items-center justify-between p-4 border rounded-lg"
						>
							<div className="flex items-center gap-4">
								{getPaymentMethodDisplay(method)}
								{method.is_default === 1 && (
									<Badge
										variant="default"
										className="bg-gradient-primary text-white border-0"
									>
										<Check className="w-3 h-3 mr-1" />
										Default
									</Badge>
								)}
							</div>

							<div className="flex gap-2">
								{method.is_default === 0 && (
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleSetDefault(method.id)}
										disabled={setDefaultMutation.isPending}
									>
										Set Default
									</Button>
								)}
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleDelete(method.id)}
									disabled={deleteMutation.isPending}
								>
									<Trash2 className="w-4 h-4" />
								</Button>
							</div>
						</div>
					))}

					{(!paymentMethods || paymentMethods.length === 0) && (
						<div className="text-center py-8">
							<p className="text-muted-foreground">
								No payment methods added yet.
							</p>
						</div>
					)}
				</div>

				{/* Delete Confirmation Dialog */}
				<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete Payment Method</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to delete this payment method? This action
								cannot be undone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel onClick={() => setMethodToDelete(null)}>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={confirmDelete}
								className="bg-destructive hover:bg-destructive/90"
							>
								Delete
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				{/* Set Default Confirmation Dialog */}
				<AlertDialog
					open={defaultDialogOpen}
					onOpenChange={setDefaultDialogOpen}
				>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Set Default Payment Method</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to set this as your default payment
								method?
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel onClick={() => setMethodToSetDefault(null)}>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction onClick={confirmSetDefault}>
								Set Default
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</CardContent>
		</Card>
	);
}
