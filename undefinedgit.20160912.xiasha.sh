cd /Users/apple/Desktop/carving/H5/20160912.xiasha
if [ ! -d yanyangfan ]
then
	mkdir yanyangfan
fi
cd yanyangfan
if [ -d fangwoxing ]
then
	cd fangwoxing
	a=$(git pull https://www.github.com/woxiaofan/fangwoxing.git)
else
	a=$(git clone https://www.github.com/woxiaofan/fangwoxing.git)
fi
echo $a
echo "completely downloaded the repository."
cd fangwoxing
a=$(npm install --production)
echo $a
echo "completely installed the dependencies."
