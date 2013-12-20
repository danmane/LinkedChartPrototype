module Utils {
	export function readyCallback(numToTrigger: number, callbackWhenReady: () => any) {
		var timesCalled = 0;
		return () => {
		       timesCalled++;
		    if (timesCalled === numToTrigger) {
		        callbackWhenReady();
		    }
		}
	}
}