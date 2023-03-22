const nums = [1,2,3,6,10,23,40,55];

const binarySearch = (arr, target) => {
  let start = 0;
  let end = arr.length - 1;

  while (start <= end){
    let mid = Math.trunc(start + (end - start) / 2);

    if (arr[mid] > target){
      end = mid - 1;
    } else if (arr[mid] < target) {
      start = mid + 1;
    } else {
      return mid;
    }
  }
  return -1;
}

const answer = binarySearch(nums, 55) // returns 3 since the index of 6 is 3
console.log(answer)