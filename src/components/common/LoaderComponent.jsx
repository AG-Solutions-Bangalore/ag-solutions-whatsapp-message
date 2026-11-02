import React from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Loader from "../loader/Loader";

const LoaderComponent = ({ data }) => {
  return (
    <div className="flex justify-center items-center h-full">
      <Button disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading {data}
      </Button>
      {/* <Loader /> */}
    </div>
  );
};

export default LoaderComponent;

export const ErrorLoaderComponent = ({ data, onClick }) => {
  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle className="text-destructive">
          Error Fetching {data}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={onClick} variant="outline">
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
};
