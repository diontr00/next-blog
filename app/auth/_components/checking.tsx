import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function Checking() {
  return (
    <div className="flex flex-col justify-center items-center mx-auto  ">
      <Card className="w-full h-40 max-w-md relative p-2 justify-center">
        <CardHeader>
          <CardTitle>Checking Information...</CardTitle>
          <CardDescription>Please Wait</CardDescription>
        </CardHeader>

        <CardFooter>
          <div className="w-full flex justify-center">
            <Spinner className="size-8" />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
